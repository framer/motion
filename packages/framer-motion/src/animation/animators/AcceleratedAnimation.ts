import { DOMKeyframesResolver } from "../../render/dom/DOMKeyframesResolver"
import { ResolvedKeyframes } from "../../render/utils/KeyframesResolver"
import { memo } from "../../utils/memo"
import { noop } from "../../utils/noop"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../utils/time-conversion"
import { MotionValue } from "../../value"
import { ValueAnimationOptions } from "../types"
import { GenericAnimation } from "./GenericAnimation"
import { MainThreadAnimation } from "./MainThreadAnimation"
import { animateStyle } from "./waapi"
import { isWaapiSupportedEasing } from "./waapi/easing"
import { getFinalKeyframe } from "./waapi/utils/get-final-keyframe"

const supportsWaapi = memo(() =>
    Object.hasOwnProperty.call(Element.prototype, "animate")
)

/**
 * A list of values that can be hardware-accelerated.
 */
const acceleratedValues = new Set<string>([
    "opacity",
    "clipPath",
    "filter",
    "transform",
])

/**
 * 10ms is chosen here as it strikes a balance between smooth
 * results (more than one keyframe per frame at 60fps) and
 * keyframe quantity.
 */
const sampleDelta = 10 //ms

/**
 * Implement a practical max duration for keyframe generation
 * to prevent infinite loops
 */
const maxDuration = 20_000

function requiresPregeneratedKeyframes<T extends string | number>(
    name: string,
    options: ValueAnimationOptions<T>
) {
    return (
        options.type === "spring" ||
        name === "backgroundColor" ||
        !isWaapiSupportedEasing(options.ease)
    )
}

function pregenerateKeyframes<T extends string | number>(
    keyframes: ResolvedKeyframes<T>,
    options: ValueAnimationOptions<T>
): ValueAnimationOptions<T> {
    const sampleAnimation = new MainThreadAnimation({
        ...options,
        keyframes,
        repeat: 0,
        delay: 0,
    })

    let state = { done: false, value: keyframes[0] }
    const pregeneratedKeyframes: T[] = []

    /**
     * Bail after 20 seconds of pre-generated keyframes as it's likely
     * we're heading for an infinite loop.
     */
    let t = 0
    while (!state.done && t < maxDuration) {
        state = sampleAnimation.sample(t)
        pregeneratedKeyframes.push(state.value)
        t += sampleDelta
    }

    return {
        times: undefined,
        keyframes: pregeneratedKeyframes,
        duration: t - sampleDelta,
        ease: "linear",
    }
}

export interface AcceleratedValueAnimationOptions<T extends string | number>
    extends ValueAnimationOptions<T> {
    name: string
    motionValue: MotionValue<T>
}

interface ResolvedAcceleratedAnimation {
    animation: Animation
    duration: number
}

export class AcceleratedAnimation<
    T extends string | number
> extends GenericAnimation<T, ResolvedAcceleratedAnimation> {
    /**
     * Cancelling an animation will write to the DOM. For safety we want to defer
     * this until the next `update` frame lifecycle. This flag tracks whether we
     * have a pending cancel, if so we shouldn't allow animations to finish.
     */
    private pendingCancel = false

    private options: AcceleratedValueAnimationOptions<T>

    constructor(options: AcceleratedValueAnimationOptions<T>) {
        super(options)
    }

    protected initPlayback(
        keyframes: ResolvedKeyframes<T>,
        startTime: number
    ): ResolvedAcceleratedAnimation {
        const { name, motionValue, duration = 300, ...options } = this.options

        /**
         * If this animation needs pre-generated keyframes then generate.
         */
        if (requiresPregeneratedKeyframes(name, this.options)) {
            this.options = {
                ...this.options,
                ...pregenerateKeyframes(keyframes, { ...options, duration }),
            }
        }

        const animation = animateStyle(
            motionValue.owner as unknown as HTMLElement,
            name,
            keyframes as string[],
            this.options
        )

        // Override the browser calculated startTime with one synchronised to other JS
        // and WAAPI animations starting this event loop.
        animation.startTime = startTime

        /**
         * Prefer the `onfinish` prop as it's more widely supported than
         * the `finished` promise.
         *
         * Here, we synchronously set the provided MotionValue to the end
         * keyframe. If we didn't, when the WAAPI animation is finished it would
         * be removed from the element which would then revert to its old styles.
         */
        animation.onfinish = () => this.complete()

        return { animation, duration: this.options.duration! }
    }

    protected initKeyframeResolver() {
        return new DOMKeyframesResolver()
    }

    get duration() {
        const { duration } = this.resolved
        return millisecondsToSeconds(duration)
    }

    get time() {
        const { animation } = this.resolved
        return millisecondsToSeconds((animation.currentTime as number) || 0)
    }

    set time(newTime: number) {
        const { animation } = this.resolved
        animation.currentTime = secondsToMilliseconds(newTime)
    }

    get speed() {
        const { animation } = this.resolved
        return animation.playbackRate
    }

    set speed(newSpeed: number) {
        const { animation } = this.resolved
        animation.playbackRate = newSpeed
    }

    get state() {
        const { animation } = this.resolved
        return animation.playState
    }

    /**
     * Replace the default DocumentTimeline with another AnimationTimeline.
     * Currently used for scroll animations.
     */
    attachTimeline(timeline: AnimationTimeline) {
        const { animation } = this.resolved

        animation.timeline = timeline
        animation.onfinish = null

        return noop<void>
    }

    play() {
        if (this.isStopped) return

        const { animation } = this.resolved
        animation.play()
    }

    pause() {
        const { animation } = this.resolved
        animation.pause()
    }

    stop() {
        this.isStopped = true
        const { animation, keyframes } = this.resolved

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
        const { time } = this

        // If the currentTime is 0 we can deduce the animation has no velocity
        if (time) {
            const { motionValue, onUpdate, onComplete, ...options } =
                this.options
            const sampleAnimation = new MainThreadAnimation({
                ...options,
                keyframes,
            })

            motionValue.setWithVelocity(
                sampleAnimation.sample(time - sampleDelta).value,
                sampleAnimation.sample(time).value,
                sampleDelta
            )
        }

        // TODO safe ancel animation here
    }

    complete() {
        const { onComplete } = this.options
        const { animation } = this.resolved

        if (animation) {
            this.value.set(
                getFinalKeyframe(this.resolvedKeyframes, this.options)
            )
            if (animation.playState !== "finished") {
                animation.onfinish = null
                animation.finish()
            }
        } else {
            // cancel keyframe resolution
        }

        onComplete && onComplete()
    }

    cancel() {}

    static supports({
        motionValue,
        name,
        repeatDelay,
        repeatType,
        damping,
        type,
    }: ValueAnimationOptions) {
        return (
            supportsWaapi() &&
            name &&
            acceleratedValues.has(name) &&
            motionValue &&
            motionValue.owner &&
            motionValue.owner.current instanceof HTMLElement &&
            /**
             * If we're outputting values to onUpdate then we can't use WAAPI as there's
             * no way to read the value from WAAPI every frame.
             */
            !motionValue.owner.getProps().onUpdate &&
            !repeatDelay &&
            repeatType !== "mirror" &&
            damping !== 0 &&
            type !== "inertia"
        )
    }
}
