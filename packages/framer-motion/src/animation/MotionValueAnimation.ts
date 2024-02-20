import { memo } from "../utils/memo"
import { noop } from "../utils/noop"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../utils/time-conversion"
import { MotionValue } from "../value"
import { isWaapiSupportedEasing } from "./animators/waapi/easing"
import { ValueAnimationOptions } from "./types"

/**
 * ValueAnimation animates a single MotionValue.
 *
 * It contains keyframes that can be resolved synchronously or asynchronously.
 *
 * When keyframes are resolved, either a JavaScript or WAAPI animation is instantiated
 * with those keyframes.
 */
export class MotionValueAnimation {
    value: MotionValue

    pendingPlaybackState: AnimationPlayState | null = null

    playSpeed = 1

    hasStopped = false

    resolvedFinishedPromise: VoidFunction

    currentFinishedPromise: Promise<void>

    resolvedDuration: number | null = null

    calculatedDuration: number | null = null

    totalDuration: number | null = null

    options: ValueAnimationOptions

    constructor(value: MotionValue, options: ValueAnimationOptions) {
        this.value = value
        this.options = options
        this.updateFinishedPromise()
    }

    onKeyframesResolved() {}

    updateFinishedPromise() {
        this.currentFinishedPromise = new Promise((resolve) => {
            this.resolvedFinishedPromise = resolve
        })
    }

    set speed(newSpeed: number) {
        this.playSpeed = newSpeed
    }

    then(resolve: VoidFunction, reject?: VoidFunction) {
        return this.currentFinishedPromise.then(resolve, reject)
    }

    play() {
        if (this.animation) {
            this.animation.play()
        } else {
            this.pendingPlaybackState = "running"
        }
    }

    pause() {}

    stop() {
        this.hasStopped = true

        const { onStop } = this.options

        onStop && onStop()
        this.cancel()
    }

    cancel() {
        this.resolvedFinishedPromise()
        this.updateFinishedPromise()
        this.keyframeResolver.cancel()
    }

    finish() {
        this.options.onComplete?.()
    }
}

export class MainThreadMotionValueAnimation extends MotionValueAnimation {
    private playState: AnimationPlayState = "idle"

    private holdTime: number | null = null

    private startTime: number | null = null

    private cancelTime: number | null = null

    private currentTime: number | null = null

    constructor(value: MotionValue, options: ValueAnimationOptions) {
        super(value, options)
    }

    pause() {
        this.playState = "paused"
        this.holdTime = this.currentTime
    }

    cancel() {
        super.cancel()
        this.playState = "idle"
        // stop animation driver
    }

    finish() {
        super.finish()
        this.playState = "finished"
    }
}

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

const requiresPregeneratedKeyframes = (
    valueName: string,
    options: ValueAnimationOptions
) =>
    options.type === "spring" ||
    valueName === "backgroundColor" ||
    !isWaapiSupportedEasing(options.ease)

export class AcceleratedMotionValueAnimation extends MotionValueAnimation {
    private animation: Animation

    constructor(value: MotionValue, options: ValueAnimationOptions) {
        if (!AcceleratedMotionValueAnimation.supports(options)) {
            return new MainThreadMotionValueAnimation(value, options)
        }

        super(value, options)
    }

    cancel() {
        super.cancel()
        this.animation.cancel()
    }

    // Force resolve ?
    pause() {
        this.animation.pause()
    }

    // Force resolve ?
    stop() {
        this.hasStopped = true

        if (this.animation.playState === "idle") return

        /**
         * WAAPI doesn't natively have any interruption capabilities.
         *
         * Rather than read commited styles back out of the DOM, we can
         * create a renderless JS animation and sample it twice to calculate
         * its current value, "previous" value, and therefore allow
         * Motion to calculate velocity for any subsequent animation.
         */
        const { currentTime } = animation

        if (currentTime) {
            // Sync resolve
            const sampleAnimation = animateValue({
                ...options,
                keyframes: resolvedKeyframes,
                autoplay: false,
            })

            value.setWithVelocity(
                sampleAnimation.sample(currentTime - sampleDelta).value,
                sampleAnimation.sample(currentTime).value,
                sampleDelta
            )
        }

        this.cancel()
    }

    // force resolve
    attachTimeline(timeline: any) {
        this.animation.timeline = timeline
        this.animation.onfinish = null

        return noop<void>
    }

    get speed() {
        return 0
    }

    // Force resolve
    get time() {
        return millisecondsToSeconds(
            (this.animation.currentTime as number) ?? 0
        )
    }

    // Force resolve
    set time(time: number) {
        this.animation.currentTime = secondsToMilliseconds(time)
    }

    get speed() {
        return this.animation.playbackRate
    }

    set speed(speed: number) {
        this.animation.playbackRate = speed
    }

    // Force resolve
    get duration() {
        return millisecondsToSeconds(this.computedDuration)
    }

    static supports({
        name,
        repeatDelay,
        repeatType,
        damping,
        driver,
        type,
    }: ValueAnimationOptions) {
        // value has owner
        return (
            supportsWaapi() &&
            name &&
            acceleratedValues.has(name) &&
            !driver &&
            !repeatDelay &&
            repeatType !== "mirror" &&
            damping !== 0 &&
            type !== "inertia"
        )
    }
}

class MainThreadAnimation {
    private playState: AnimationPlayState = "idle"

    private holdTime: number | null = null

    private startTime: number | null = null

    private cancelTime: number | null = null

    private currentTime: number | null = null

    constructor(private options: ValueAnimationOptions) {}

    pause() {
        this.playState = "paused"
        this.holdTime = this.currentTime
    }

    cancel() {
        this.playState = "idle"
    }

    finish() {
        this.playState = "finished"
    }
}
