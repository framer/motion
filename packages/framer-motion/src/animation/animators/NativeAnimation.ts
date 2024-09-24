import { noop } from "../../utils/noop"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../utils/time-conversion"
import {
    AnimationPlaybackControls,
    ValueAnimationOptions,
    ValueKeyframesDefinition,
} from "../types"

// const supportsWaapi = /*@__PURE__*/ memo(() =>
//     Object.hasOwnProperty.call(Element.prototype, "animate")
// )

interface ResolvedAcceleratedAnimation {
    animation: Animation
    duration: number
    times: ValueAnimationOptions["times"]
    type: ValueAnimationOptions["type"]
    ease: ValueAnimationOptions["ease"]
    keyframes: string[] | number[]
}

export class NativeAnimation implements AnimationPlaybackControls {
    _resolved: ResolvedAcceleratedAnimation
    resolved: ResolvedAcceleratedAnimation

    /**
     * An AnimationTimline to attach to the WAAPI animation once it's created.
     */
    pendingTimeline: AnimationTimeline | undefined
    private isStopped = false

    constructor(
        _element: Element,
        _valueName: string,
        _valueKeyframes: ValueKeyframesDefinition,
        _valueOptions: ValueAnimationOptions
    ) {}

    then() {
        return true as any
    }

    get duration() {
        const { resolved } = this
        if (!resolved) return 0
        const { duration } = resolved
        return millisecondsToSeconds(duration)
    }

    get time() {
        const { resolved } = this
        if (!resolved) return 0
        const { animation } = resolved
        return millisecondsToSeconds((animation.currentTime as number) || 0)
    }

    set time(newTime: number) {
        const { resolved } = this
        if (!resolved) return

        const { animation } = resolved
        animation.currentTime = secondsToMilliseconds(newTime)
    }

    get speed() {
        const { resolved } = this
        if (!resolved) return 1

        const { animation } = resolved
        return animation.playbackRate
    }

    set speed(newSpeed: number) {
        const { resolved } = this
        if (!resolved) return

        const { animation } = resolved
        animation.playbackRate = newSpeed
    }

    get state() {
        const { resolved } = this
        if (!resolved) return "idle"

        const { animation } = resolved
        return animation.playState
    }

    get startTime() {
        const { resolved } = this
        if (!resolved) return null

        const { animation } = resolved

        // Coerce to number as TypeScript incorrectly types this
        // as CSSNumberish
        return animation.startTime as number
    }

    /**
     * Replace the default DocumentTimeline with another AnimationTimeline.
     * Currently used for scroll animations.
     */
    attachTimeline(timeline: any) {
        if (!this._resolved) {
            this.pendingTimeline = timeline
        } else {
            const { resolved } = this
            if (!resolved) return noop<void>

            const { animation } = resolved

            animation.timeline = timeline
            animation.onfinish = null
        }

        return noop<void>
    }

    updateFinishedPromise() {}

    resolveFinishedPromise() {}

    play() {
        if (this.isStopped) return
        const { resolved } = this
        if (!resolved) return

        const { animation } = resolved

        if (animation.playState === "finished") {
            this.updateFinishedPromise()
        }

        animation.play()
    }

    pause() {
        const { resolved } = this
        if (!resolved) return

        const { animation } = resolved
        animation.pause()
    }

    stop() {
        // this.resolver.cancel()
        this.isStopped = true
        if (this.state === "idle") return

        this.resolveFinishedPromise()
        this.updateFinishedPromise()

        const { resolved } = this
        if (!resolved) return

        const { animation } = resolved

        if (
            animation.playState === "idle" ||
            animation.playState === "finished"
        ) {
            return
        }

        /**
         * WAAPI doesn't natively have any interruption capabilities.
         *
         * Rather than read commited styles back out of the DOM, we can
         * create a renderless JS animation and sample it twice to calculate
         * its current value, "previous" value, and therefore allow
         * Motion to calculate velocity for any subsequent animation.
         */
        if (this.time) {
            // const { motionValue, onUpdate, onComplete, element, ...options } =
            //     this.options
            // const sampleAnimation = new MainThreadAnimation({
            //     ...options,
            //     keyframes,
            //     duration,
            //     type,
            //     ease,
            //     times,
            //     isGenerator: true,
            // })
            // const sampleTime = secondsToMilliseconds(this.time)
            // motionValue.setWithVelocity(
            //     sampleAnimation.sample(sampleTime - sampleDelta).value,
            //     sampleAnimation.sample(sampleTime).value,
            //     sampleDelta
            // )
        }

        // const { onStop } = this.options
        // onStop && onStop()

        this.cancel()
    }

    complete() {
        const { resolved } = this
        if (!resolved) return
        resolved.animation.finish()
    }

    cancel() {
        const { resolved } = this
        if (!resolved) return
        resolved.animation.cancel()
    }
}
