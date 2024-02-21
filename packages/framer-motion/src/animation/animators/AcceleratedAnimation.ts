import { ResolvedKeyframes } from "../../render/utils/KeyframesResolver"
import { memo } from "../../utils/memo"
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

const requiresPregeneratedKeyframes = (
    name: string,
    options: ValueAnimationOptions
) =>
    options.type === "spring" ||
    name === "backgroundColor" ||
    !isWaapiSupportedEasing(options.ease)

export class AcceleratedAnimation<
    T extends string | number
> extends GenericAnimation<T> {
    private animation: Animation | undefined

    /**
     * Cancelling an animation will write to the DOM. For safety we want to defer
     * this until the next `update` frame lifecycle. This flag tracks whether we
     * have a pending cancel, if so we shouldn't allow animations to finish.
     */
    private pendingCancel = false

    constructor(value: MotionValue, options: ValueAnimationOptions) {
        super(value, options)
    }

    protected initPlayback(keyframes: ResolvedKeyframes<T>, startTime: number) {
        const { name } = this.options

        /**
         * If this animation needs pre-generated keyframes then generate.
         */
        if (requiresPregeneratedKeyframes(name, this.options)) {
            const sampleAnimation = new MainThreadAnimation({
                ...this.options,
                keyframes,
                repeat: 0,
                delay: 0,
            })
            let state = { done: false, value: keyframes[0] }
            const pregeneratedKeyframes: number[] = []

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

            this.options = {
                ...this.options,
                times: undefined,
                keyframes: pregeneratedKeyframes,
                duration: t - sampleDelta,
                ease: "linear",
            }
        }

        this.animation = animateStyle(
            this.value.owner as HTMLElement,
            name,
            keyframes,
            this.options
        )

        // Override the browser calculated startTime with one synchronised to other JS
        // and WAAPI animations starting this event loop.
        this.animation.startTime = startTime

        /**
         * Prefer the `onfinish` prop as it's more widely supported than
         * the `finished` promise.
         *
         * Here, we synchronously set the provided MotionValue to the end
         * keyframe. If we didn't, when the WAAPI animation is finished it would
         * be removed from the element which would then revert to its old styles.
         */
        this.animation.onfinish = () => this.complete()
    }

    get duration() {}

    set duration() {}

    get time() {}

    set time() {}

    get speed() {}

    set speed() {}

    get state() {
        return this.animation ? this.animation.playState : "idle"
    }

    play() {}

    pause() {}

    stop() {}

    // TODO Protect
    complete() {
        // TODO If pending cancel, don't complete

        const { onComplete } = this.options

        if (this.animation) {
            this.value.set(
                getFinalKeyframe(this.resolvedKeyframes, this.options)
            )
            if (this.animation.playState !== "finished") {
                this.animation.onfinish = null
                this.animation.finish()
            }
        } else {
            // cancel keyframe resolution
        }

        onComplete && onComplete()
    }

    cancel() {}

    static supports(
        value: MotionValue,
        { name, repeatDelay, repeatType, damping, type }: ValueAnimationOptions
    ) {
        return (
            supportsWaapi() &&
            value.owner &&
            value.owner.current instanceof HTMLElement &&
            /**
             * If we're outputting values to onUpdate then we can't use WAAPI as there's
             * no way to read the value from WAAPI every frame.
             */
            !value.owner.getProps().onUpdate &&
            name &&
            acceleratedValues.has(name) &&
            !repeatDelay &&
            repeatType !== "mirror" &&
            damping !== 0 &&
            type !== "inertia"
        )
    }
}
