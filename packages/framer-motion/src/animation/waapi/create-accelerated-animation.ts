import { EasingDefinition } from "../../easing/types"
import { sync } from "../../frameloop"
import type { VisualElement } from "../../render/VisualElement"
import type { MotionValue } from "../../value"
import { AnimationOptions } from "../types"
import { animateStyle } from "./"
import { isWaapiSupportedEasing } from "./easing"
import { supports } from "./supports"
import { getFinalKeyframe } from "./utils/get-final-keyframe"
import { animateValue } from "../js"

/**
 * A list of values that can be hardware-accelerated.
 */
const acceleratedValues = new Set<string>([
    "opacity",
    "clipPath",
    "filter",
    "transform",
    "backgroundColor",
])

/**
 * 10ms is chosen here as it strikes a balance between smooth
 * results (more than one keyframe per frame at 60fps) and
 * keyframe quantity.
 */
const sampleDelta = 10 //ms

const requiresPregeneratedKeyframes = (
    valueName: string,
    options: AnimationOptions
) =>
    options.type === "spring" ||
    valueName === "backgroundColor" ||
    !isWaapiSupportedEasing(options.ease)

export function createAcceleratedAnimation(
    value: MotionValue,
    valueName: string,
    { onUpdate, onComplete, ...options }: AnimationOptions
) {
    const canAccelerateAnimation =
        supports.waapi() &&
        acceleratedValues.has(valueName) &&
        !options.repeatDelay &&
        options.repeatType !== "mirror" &&
        options.damping !== 0 &&
        options.type !== "inertia"

    if (!canAccelerateAnimation) return false

    let { keyframes, duration = 300, ease } = options

    /**
     * If this animation needs pre-generated keyframes then generate.
     *
     * TODO See if this can be unified with pregenerate keyframes
     */
    if (requiresPregeneratedKeyframes(valueName, options)) {
        const sampleAnimation = animateValue({
            ...options,
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
        while (!state.done && t < 20000) {
            // TODO Reinstate sample
            state = sampleAnimation.sample(t)
            pregeneratedKeyframes.push(state.value)
            t += sampleDelta
        }

        keyframes = pregeneratedKeyframes
        duration = t - sampleDelta
        ease = "linear"
    }

    const animation = animateStyle(
        (value.owner as VisualElement<HTMLElement>).current!,
        valueName,
        keyframes,
        {
            ...options,
            duration,
            /**
             * This function is currently not called if ease is provided
             * as a function so the cast is safe.
             *
             * However it would be possible for a future refinement to port
             * in easing pregeneration from Motion One for browsers that
             * support the upcoming `linear()` easing function.
             */
            ease: ease as EasingDefinition,
        }
    )

    /**
     * Prefer the `onfinish` prop as it's more widely supported than
     * the `finished` promise.
     *
     * Here, we synchronously set the provided MotionValue to the end
     * keyframe. If we didn't, when the WAAPI animation is finished it would
     * be removed from the element which would then revert to its old styles.
     */
    animation.onfinish = () => {
        value.set(getFinalKeyframe(keyframes, options))
        sync.update(() => animation.cancel())
        onComplete && onComplete()
    }

    /**
     * Animation interrupt callback.
     */
    return {
        get currentTime() {
            return animation.currentTime || 0
        },
        set currentTime(t: number) {
            animation.currentTime = t
        },
        stop: () => {
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
                const sampleAnimation = animateValue({
                    ...options,
                    autoplay: false,
                })
                value.setWithVelocity(
                    sampleAnimation.sample(currentTime - sampleDelta).value,
                    sampleAnimation.sample(currentTime).value,
                    sampleDelta
                )
            }
            sync.update(() => animation.cancel())
        },
    }
}
