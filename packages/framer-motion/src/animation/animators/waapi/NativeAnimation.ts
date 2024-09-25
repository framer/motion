import { startWaapiAnimation } from "."
import { ProgressTimeline } from "../../../render/dom/scroll/observe"
import { numberValueTypes } from "../../../render/dom/value-types/number"
import { memo } from "../../../utils/memo"
import { noop } from "../../../utils/noop"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../../utils/time-conversion"
import { isGenerator } from "../../generators/utils/is-generator"
import { pregenerateKeyframes } from "../../generators/utils/pregenerate"
import {
    AnimationPlaybackControls,
    UnresolvedValueKeyframe,
    ValueAnimationOptions,
    ValueKeyframe,
    ValueKeyframesDefinition,
} from "../../types"
import { attachTimeline } from "./utils/attach-timeline"
import { supportsLinearEasing } from "./utils/supports-linear-easing"
import { supportsWaapi } from "./utils/supports-waapi"

const state = new WeakMap<Element, Map<string, NativeAnimation>>()

const supportsPartialKeyframes = memo(() => {
    try {
        document.createElement("div").animate({ opacity: [1] })
    } catch (e) {
        return false
    }
    return true
})

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

    constructor(
        element: Element,
        valueName: string,
        valueKeyframes: number | string | ValueKeyframesDefinition,
        options: ValueAnimationOptions
    ) {
        this.options = options
        const existingAnimation = state.get(element)?.get(valueName)
        console.log(existingAnimation)
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

        const { type = "keyframes" } = options
        if (isGenerator(type)) {
            const generator = type({ ...options, keyframes: [0, 100] })
            const pregenerated = pregenerateKeyframes(generator)
            options.duration = pregenerated.duration

            if (supportsLinearEasing()) {
                options.ease = (progress: number) =>
                    generator.next(pregenerated.duration * progress).value / 100
            } else {
                options.ease = "easeOut"
            }
        }

        /**
         * TODO:
         *  - Polyfill promise
         *  - Ensure final keyframe is applied on animation complete
         *  - Add duration
         *  - Add timeline() for animateDom
         *  - Tests
         */

        if (!supportsWaapi()) {
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
        return this.options.duration || 0.3
    }

    get time() {
        return millisecondsToSeconds(
            (this.animation?.currentTime as number) || 0
        )
    }

    set time(newTime: number) {
        // TODO Force resolve
        if (this.animation) {
            this.animation.currentTime = secondsToMilliseconds(newTime)
        }
    }

    get speed() {
        return this.animation?.playbackRate || 1
    }

    set speed(newSpeed: number) {
        // TODO Force resolve
        if (this.animation) {
            this.animation.playbackRate = newSpeed
        }
    }

    get state() {
        return this.animation?.playState || "idle"
    }

    get startTime() {
        return this.animation ? (this.animation.startTime as number) : null
    }

    play() {}

    pause() {}

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

    complete() {}

    cancel() {}

    then() {
        return new Promise(() => {}) as any
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
