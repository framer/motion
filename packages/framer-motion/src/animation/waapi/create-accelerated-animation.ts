import { EasingDefinition } from "../../easing/types"
import { sync } from "../../frameloop"
import type { VisualElement } from "../../render/VisualElement"
import type { MotionValue } from "../../value"
import { animate } from "../legacy-popmotion"
import { AnimationOptions } from "../types"
import { animateStyle } from "./"
import { isEasingSupported } from "./easing"

/**
 * 10ms is chosen here as it strikes a balance between smooth
 * results (more than one keyframe per frame at 60fps) and
 * keyframe quantity.
 */
const sampleDelta = 10 //ms

export function createAcceleratedAnimation(
    value: MotionValue,
    valueName: string,
    { onUpdate, onComplete, ...options }: AnimationOptions
) {
    let { keyframes, duration = 0.3, elapsed = 0, ease } = options

    /**
     * If this animation needs pre-generated keyframes then generate.
     */
    if (options.type === "spring" || !isEasingSupported(options.ease)) {
        const sampleAnimation = animate(options)
        let state = { done: false, value: keyframes[0] }
        const pregeneratedKeyframes: number[] = []

        let t = 0
        while (!state.done) {
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
            delay: -elapsed,
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
        value.set(keyframes[keyframes.length - 1])
        onComplete && onComplete()
    }

    /**
     * Animation interrupt callback.
     */
    return () => {
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
            const sampleAnimation = animate(options)
            value.setWithVelocity(
                sampleAnimation.sample(currentTime - sampleDelta).value,
                sampleAnimation.sample(currentTime).value,
                sampleDelta
            )
        }

        sync.update(() => animation.cancel())
    }
}
