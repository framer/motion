import { mixComplex } from "popmotion"
import { animate } from "../../animation/animate"
import { ResolvedValues, VisualElement } from "../../render/types"
import { motionValue } from "../../value"
import type {
    ElementTimelineState,
    TimelineController,
    TimelineProps,
    UnresolvedTimeline,
} from "./types"
import {
    createUnresolvedTimeline,
    createValueTransformers,
} from "./utils/create-timeline"

export function createTimeline(props: TimelineProps): TimelineController {
    const registeredElements = new Map<VisualElement, ElementTimelineState>()

    let isInitialRender = true
    const timeProgress = motionValue(props.initial === false ? 1 : 0)
    let progress = props.progress || timeProgress
    let unresolvedTimeline: UnresolvedTimeline

    function updateUnresolvedTimeline() {
        unresolvedTimeline = createUnresolvedTimeline(props.animate)
    }

    updateUnresolvedTimeline()

    function startAnimation() {
        animate(timeProgress, [0, 1], {
            duration: unresolvedTimeline.duration,
            ease: "linear",
            ...props.transition,
        } as any)
    }

    function registerElement(element: VisualElement) {
        if (registeredElements.has(element)) {
            removeElement(element)
        }

        const trackId = element.getProps().track

        if (!trackId) return

        const unsubscribe = progress.onChange(() => element.scheduleRender())

        const timeToValue = createValueTransformers(
            unresolvedTimeline.tracks[trackId],
            element.readValue
        )

        registeredElements.set(element, {
            unsubscribe,
            timeToValue,
            crossfade: {},
            latestResolvedValues: {},
        })
    }

    function removeElement(element: VisualElement) {
        const state = registeredElements.get(element)
        if (state && state.unsubscribe) {
            state.unsubscribe()
        }

        registeredElements.delete(element)
    }

    return {
        update(newProps: TimelineProps) {
            props = newProps
            progress = props.progress || timeProgress

            updateUnresolvedTimeline()

            if (
                !isInitialRender ||
                (isInitialRender && props.initial !== false)
            ) {
                startAnimation()
            }

            /**
             * Rescubscribe
             */
            if (!isInitialRender) {
                const currentElements = new Map(registeredElements)
                currentElements.forEach((_, element) => removeElement(element))
                currentElements.forEach((_, element) =>
                    registerElement(element)
                )
            }

            isInitialRender = false
        },

        getInitialValues(trackName) {
            const { tracks } = unresolvedTimeline
            const track = tracks[trackName]
            const currentProgress = progress.get()
            const values: ResolvedValues = {}

            for (const valueName in track) {
                const unresolvedKeyframes = track[valueName]
                const index =
                    currentProgress === 1 ? unresolvedKeyframes.length - 1 : 0
                const { value } = unresolvedKeyframes[index]

                if (value !== null) values[valueName] = value
            }

            return values
        },

        registerElement,
        removeElement,

        merge(element) {
            const state = registeredElements.get(element)

            if (!state || !unresolvedTimeline) return

            const { duration } = unresolvedTimeline
            const currentProgress = progress.get()

            const latestValues = element.getLatestValues()

            for (const key in state.timeToValue) {
                const value = state.timeToValue[key](currentProgress * duration)
                state.latestResolvedValues[key] = latestValues[key] = value
            }

            for (const key in element.latestComponentValues) {
                latestValues[key] = element.latestComponentValues[key]
            }

            for (const key in state.crossfade) {
                const { mix, fromValue } = state.crossfade[key]

                if (state.latestResolvedValues[key] !== undefined) {
                    latestValues[key] = mixComplex(
                        state.latestResolvedValues[key],
                        fromValue
                    )(mix.get())
                }
            }
        },

        startCrossfade(element, valueName) {
            const state = registeredElements.get(element)
            if (!state) return

            const existingCrossfade = state.crossfade[valueName]
            if (existingCrossfade) {
                existingCrossfade.mix.stop()
            }

            const fromValue = element.latestComponentValues[valueName]
            delete element.latestComponentValues[valueName]
            element.removeValue(valueName)

            if (fromValue === undefined) return

            const mix = motionValue(1)
            state.crossfade[valueName] = { fromValue, mix }

            animate(mix, 0, {
                ...(element.getDefaultTransition() as any),
                onUpdate: () => element.scheduleRender(),
                onComplete: () => {
                    delete state.crossfade[valueName]
                },
            })
        },

        cancelCrossfade(element, valueName) {
            const state = registeredElements.get(element)
            if (!state) return

            state.crossfade[valueName]?.mix.stop()

            delete state.crossfade[valueName]
        },

        isAnimating(element, valueName) {
            const state = registeredElements.get(element)
            return Boolean(state && state.timeToValue[valueName])
        },
    }
}
