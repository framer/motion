import { startWaapiAnimation } from "."
import { ProgressTimeline } from "../../../render/dom/scroll/observe"
import { numberValueTypes } from "../../../render/dom/value-types/number"
import { noop } from "../../../utils/noop"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../../utils/time-conversion"
import {
    AnimationPlaybackControls,
    UnresolvedValueKeyframe,
    ValueAnimationOptions,
    ValueKeyframe,
    ValueKeyframesDefinition,
} from "../../types"
import { attachTimeline } from "./utils/attach-timeline"
import { createGeneratorEasing } from "./utils/generator-easing"
import { getFinalKeyframe } from "./utils/get-final-keyframe"
import { setCSSVar, setStyle } from "./utils/style"
import { supportsPartialKeyframes } from "./utils/supports-partial-keyframes"
import { supportsWaapi } from "./utils/supports-waapi"

const state = new WeakMap<Element, Map<string, NativeAnimation>>()

function hydrateKeyframes(
    valueName: string,
    keyframes: ValueKeyframe[] | UnresolvedValueKeyframe[],
    read: () => string | number
) {
    for (let i = 0; i < keyframes.length; i++) {
        if (keyframes[i] === null) {
            keyframes[i] = i === 0 ? read() : keyframes[i - 1]
        }

        if (typeof keyframes[i] === "number" && numberValueTypes[valueName]) {
            keyframes[i] = numberValueTypes[valueName].transform!(keyframes[i])
        }
    }
}

export class NativeAnimation implements AnimationPlaybackControls {
    animation: Animation

    options: ValueAnimationOptions

    private pendingTimeline: ProgressTimeline | undefined

    // Resolve the current finished promise
    private resolveFinishedPromise: VoidFunction

    // A promise that resolves when the animation is complete
    private currentFinishedPromise: Promise<void>

    private setValue: (
        element: HTMLElement,
        name: string,
        value: string
    ) => void

    constructor(
        element: Element,
        valueName: string,
        valueKeyframes: ValueKeyframesDefinition,
        options: ValueAnimationOptions
    ) {
        const isCSSVar = valueName.startsWith("--")
        this.setValue = isCSSVar ? setCSSVar : setStyle
        this.options = options
        this.updateFinishedPromise()

        const existingAnimation = state.get(element)?.get(valueName)
        if (existingAnimation) {
            existingAnimation.stop()
        }

        const readInitialKeyframe = () => {
            return valueName.startsWith("--")
                ? (element as HTMLElement).style.getPropertyValue(valueName)
                : window.getComputedStyle(element)[valueName as any]
        }

        if (!Array.isArray(valueKeyframes)) {
            valueKeyframes = [valueKeyframes]
        }

        hydrateKeyframes(valueName, valueKeyframes, readInitialKeyframe)

        createGeneratorEasing(options)

        const onFinish = () => {
            this.setValue(
                element as HTMLElement,
                valueName,
                getFinalKeyframe(valueKeyframes as string[], this.options)
            )
            this.cancel()
            this.resolveFinishedPromise()
        }

        if (!supportsWaapi()) {
            onFinish()
        } else {
            if (!supportsPartialKeyframes() && !Array.isArray(valueKeyframes)) {
                valueKeyframes = [readInitialKeyframe(), valueKeyframes]
            }

            this.animation = startWaapiAnimation(
                element,
                valueName,
                valueKeyframes as string[],
                options
            )

            if (options.autoplay === false) {
                this.animation.pause()
            }

            this.animation.onfinish = onFinish

            if (this.pendingTimeline) {
                attachTimeline(this.animation, this.pendingTimeline)
            }

            const elementAnimationState =
                state.get(element) || new Map<string, NativeAnimation>()
            elementAnimationState.set(valueName, this)
            state.set(element, elementAnimationState)
        }
    }

    get duration() {
        return millisecondsToSeconds(this.options.duration || 300)
    }

    get time() {
        return millisecondsToSeconds(
            (this.animation?.currentTime as number) || 0
        )
    }

    set time(newTime: number) {
        if (this.animation) {
            this.animation.currentTime = secondsToMilliseconds(newTime)
        }
    }

    get speed() {
        return this.animation?.playbackRate || 1
    }

    set speed(newSpeed: number) {
        if (this.animation) {
            this.animation.playbackRate = newSpeed
        }
    }

    get state() {
        return this.animation?.playState || "finished"
    }

    get startTime() {
        return this.animation ? (this.animation.startTime as number) : null
    }

    play() {
        if (this.state === "finished") {
            this.updateFinishedPromise()
        }

        this.animation && this.animation.play()
    }

    pause() {
        this.animation && this.animation.pause()
    }

    stop() {
        if (
            !this.animation ||
            this.state === "idle" ||
            this.state === "finished"
        ) {
            return
        }

        this.animation.commitStyles()
        try {
            this.animation.cancel()
        } catch (e) {}
    }

    complete() {
        this.animation && this.animation.finish()
    }

    cancel() {
        this.animation && this.animation.cancel()
    }

    /**
     * Allows the returned animation to be awaited or promise-chained. Currently
     * resolves when the animation finishes at all but in a future update could/should
     * reject if its cancels.
     */
    then(resolve: VoidFunction, reject?: VoidFunction) {
        return this.currentFinishedPromise.then(resolve, reject)
    }

    private updateFinishedPromise() {
        this.currentFinishedPromise = new Promise((resolve) => {
            this.resolveFinishedPromise = resolve
        })
    }

    attachTimeline(timeline: any) {
        if (!this.animation) {
            this.pendingTimeline = timeline
        } else {
            attachTimeline(this.animation, timeline)
        }

        return noop<void>
    }
}
