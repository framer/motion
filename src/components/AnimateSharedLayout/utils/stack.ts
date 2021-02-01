import { Presence, SharedLayoutAnimationConfig } from "../types"
import { AxisBox2D, Point2D } from "../../../types/geometry"
import { ResolvedValues, VisualElement } from "../../../render/types"
import { motionValue } from "../../../value"
import { animate } from "../../../animation/animate"
import { createVisualState, VisualState } from "../../../render/utils/state"
import { circOut, linear, mix, progress } from "popmotion"
import { getFrameData } from "framesync"
import { EasingFunction, Transition } from "../../../types"

export interface Snapshot {
    isDragging?: boolean
    cursorProgress?: Point2D
    latestMotionValues: ResolvedValues
    boundingBox?: AxisBox2D
}

export type LeadAndFollow = [
    VisualElement | undefined,
    VisualElement | undefined
]

export interface LayoutStack {
    add(element: VisualElement): void
    remove(element: VisualElement): void
    getLead(): VisualElement | undefined
    updateSnapshot(): void
    clearSnapshot(): void
    animate(element: VisualElement, crossfade: boolean): void
    updateLeadAndFollow(): void
}

export interface CrossfadeState {
    isCrossfading(): boolean
    getValues(element: VisualElement): VisualState
    crossfadeFromLead(transition?: Transition): void
    crossfadeToLead(
        transition?: Transition,
        maintainFollowOpacity?: boolean
    ): void
    reset(): void
    stopAnimation(): void
}

// TODO: This whole file can do with rewriting
export function createCrossfadeState(
    state: StackState,
    forceCrossfade: boolean = false
): CrossfadeState {
    let followValues = createVisualState({})
    let leadValues = createVisualState({})
    const crossfadeProgress = motionValue(1)
    let lastUpdate = 0
    let maintainFollowOpacity = false

    function animateProgress(to: number, transition?: Transition) {
        const update = () => {
            state.lead && state.lead.scheduleRender()
            state.follow && state.follow.scheduleRender()
        }

        animate(crossfadeProgress, to, {
            ...(transition ||
                (state.lead ? state.lead.getDefaultTransition() : {})),
            onUpdate: update,
            onComplete: update,
        })
    }

    function updateValues() {
        const { timestamp } = getFrameData()
        if (timestamp === lastUpdate) return
        lastUpdate = timestamp

        const p = crossfadeProgress.get()

        const { follow, lead } = state
        if (!follow || !lead) return
        if (forceCrossfade || follow.isPresenceRoot || lead.isPresenceRoot) {
            const followTargetOpacity = follow.getStaticValue("opacity") ?? 1
            const leadTargetOpacity = lead.getStaticValue("opacity") ?? 1

            // TODO Make this configurable by crossfade
            followValues.values.opacity = maintainFollowOpacity
                ? followTargetOpacity
                : mix(followTargetOpacity as number, 0, easeCrossfadeOut(p))
            leadValues.values.opacity = mix(
                0,
                leadTargetOpacity as number,
                easeCrossfadeIn(p)
            )
        }

        mixBorderRadius(follow, lead, followValues.values, leadValues.values, p)

        leadValues.projection = followValues.projection = lead.getProjection()
    }

    return {
        crossfadeFromLead(transition) {
            animateProgress(0, transition)
            followValues = createVisualState({})
            leadValues = createVisualState({})
        },
        crossfadeToLead(transition, newMaintainFollowOpacity = false) {
            maintainFollowOpacity = newMaintainFollowOpacity
            crossfadeProgress.set(1 - crossfadeProgress.get())
            animateProgress(1, transition)
            followValues = createVisualState({})
            leadValues = createVisualState({})
        },
        isCrossfading() {
            return Boolean(
                state.lead && state.follow // && crossfadeProgress.get() !== 1
            )
        },
        getValues(element) {
            updateValues()
            return element === state.lead ? leadValues : followValues
        },
        reset() {
            crossfadeProgress.set(1)
        },
        stopAnimation() {
            crossfadeProgress.stop()
        },
    }
}

interface StackState {
    lead?: VisualElement
    follow?: VisualElement
    leadIsExiting: boolean
}

export function layoutStack(): LayoutStack {
    const stack = new Set<VisualElement>()
    const state: StackState = { leadIsExiting: false }
    let prevState: StackState = { ...state }

    let prevViewportBox: AxisBox2D | undefined
    let crossfadeState = createCrossfadeState(state)
    let needsCrossfadeAnimation = false

    function getFollowViewportBox() {
        return state.follow ? state.follow.prevViewportBox : prevViewportBox
    }

    function getFollowLayout() {
        return state.follow?.getLayoutState().layout
    }

    return {
        add(element) {
            element.setCrossfadeState(crossfadeState)
            stack.add(element)
            if (!state.lead) state.lead = element
        },
        remove(element) {
            stack.delete(element)
        },
        getLead() {
            return state.lead
        },
        updateSnapshot() {
            prevViewportBox = state.lead?.prevViewportBox
        },
        clearSnapshot() {
            prevViewportBox = undefined
        },
        // TODO We might not need this
        updateLeadAndFollow() {
            prevState = { ...state }

            let lead: VisualElement | undefined
            let follow: VisualElement | undefined
            const order = Array.from(stack)
            for (let i = order.length; i--; i >= 0) {
                const element = order[i]
                if (lead) follow ??= element
                lead ??= element
                if (lead && follow) break
            }
            state.lead = lead
            state.follow = follow
            state.leadIsExiting = state.lead?.presence === Presence.Exiting

            if (
                prevState.lead !== state.lead ||
                prevState.leadIsExiting !== state.leadIsExiting
            ) {
                if (!state.follow) {
                    crossfadeState.reset()
                } else {
                    needsCrossfadeAnimation = true
                }
            }
        },
        animate(child, shouldCrossfade = false) {
            if (child === state.lead) {
                if (shouldCrossfade) {
                    child.pointTo(state.lead)
                } else {
                    child.setVisibility(true)
                }

                const config: SharedLayoutAnimationConfig = {}
                if (child.presence === Presence.Entering) {
                    config.originBox = getFollowViewportBox()
                } else if (child.presence === Presence.Exiting) {
                    config.targetBox = getFollowLayout()
                }

                if (needsCrossfadeAnimation) {
                    needsCrossfadeAnimation = false
                    child.presence === Presence.Entering
                        ? crossfadeState.crossfadeToLead()
                        : crossfadeState.crossfadeFromLead()
                }

                child.notifyLayoutReady(config)
            } else {
                if (shouldCrossfade) {
                    state.lead && child.pointTo(state.lead)
                } else {
                    child.setVisibility(false)
                }
            }
        },
    }
}

const easeCrossfadeIn = compress(0, 0.5, circOut)
const easeCrossfadeOut = compress(0.5, 0.95, linear)

function compress(
    min: number,
    max: number,
    easing: EasingFunction
): EasingFunction {
    return (p: number) => {
        // Could replace ifs with clamp
        if (p < min) return 0
        if (p > max) return 1
        return easing(progress(min, max, p))
    }
}

const borders = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]
const numBorders = borders.length
function mixBorderRadius(
    from: VisualElement,
    to: VisualElement,
    fromValues: ResolvedValues,
    toValues: ResolvedValues,
    p: number
) {
    const fromLatest = from.getLatestValues()
    const toLatest = to.getLatestValues()
    for (let i = 0; i < numBorders; i++) {
        const borderLabel = "border" + borders[i] + "Radius"
        const fromRadius =
            fromLatest[borderLabel] ?? fromLatest.borderRadius ?? 0
        const toRadius = toLatest[borderLabel] ?? toLatest.borderRadius ?? 0
        // TODO We should only do this if we have border radius
        // But not doing it at all isn't correctly animating 0 -> 0 that have
        // previously encountered a crossfade to/from a radius
        if (typeof fromRadius === "number" && typeof toRadius === "number") {
            fromValues[borderLabel] = toValues[borderLabel] = mix(
                fromRadius as number,
                toRadius as number,
                p
            )
        }
    }
    if (fromLatest.rotate || toLatest.rotate) {
        fromValues.rotate = toValues.rotate = mix(
            (fromLatest.rotate as number) || 0,
            (toLatest.rotate as number) || 0,
            p
        )
    }
}
