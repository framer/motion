import { EasingDefinition } from "../../easing/types"
import { sync } from "../../frameloop"
import type { VisualElement } from "../../render/VisualElement"
import type { MotionValue } from "../../value"
import { animate } from "../legacy-popmotion"
import { spring } from "../legacy-popmotion/spring"
import { AnimationOptions } from "../types"
import { animateStyle } from "./"

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
     * If this is a spring animation, pre-generate keyframes and
     * record duration.
     *
     * TODO: When introducing support for values beyond opacity it
     * might be better to use `animate.sample()`
     */
    if (options.type === "spring") {
        const springAnimation = spring(options)
        let state = { done: false, value: keyframes[0] }
        const springKeyframes: number[] = []

        let t = 0
        while (!state.done) {
            state = springAnimation.next(t)
            springKeyframes.push(state.value)
            t += sampleDelta
        }

        keyframes = springKeyframes
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
                sampleAnimation.sample(currentTime - sampleDelta),
                sampleAnimation.sample(currentTime),
                sampleDelta
            )
        }

        sync.update(() => animation.cancel())
    }
}
