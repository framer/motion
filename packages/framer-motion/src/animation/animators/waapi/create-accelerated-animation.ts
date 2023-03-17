import { EasingDefinition } from "../../../easing/types"
import { sync } from "../../../frameloop"
import type { VisualElement } from "../../../render/VisualElement"
import type { MotionValue } from "../../../value"
import { AnimationOptions, AnimationPlaybackControls } from "../../types"
import { animateStyle } from "."
import { isWaapiSupportedEasing } from "./easing"
import { supports } from "./supports"
import { getFinalKeyframe } from "./utils/get-final-keyframe"
import { animateValue } from "../js"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../../utils/time-conversion"

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

/**
 * Implement a practical max duration for keyframe generation
 * to prevent infinite loops
 */
const maxDuration = 20_000

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
): AnimationPlaybackControls | false {
    const canAccelerateAnimation =
        supports.waapi() &&
        acceleratedValues.has(valueName) &&
        !options.repeatDelay &&
        options.repeatType !== "mirror" &&
        options.damping !== 0 &&
        options.type !== "inertia"

    if (!canAccelerateAnimation) return false

    /**
     * TODO: Unify with js/index
     */
    let resolveFinishedPromise: VoidFunction
    let currentFinishedPromise: Promise<void>

    /**
     * Create a new finished Promise every time we enter the
     * finished state and resolve the old Promise. This is
     * WAAPI-compatible behaviour.
     */
    const updateFinishedPromise = () => {
        currentFinishedPromise = new Promise((resolve) => {
            resolveFinishedPromise = resolve
        })
    }

    // Create the first finished promise
    updateFinishedPromise()

    let { keyframes, duration = 300, ease } = options

    /**
     * If this animation needs pre-generated keyframes then generate.
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
        while (!state.done && t < maxDuration) {
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

    const safeCancel = () => {
        sync.update(() => animation.cancel())
        resolveFinishedPromise()
        updateFinishedPromise()
    }

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
        onComplete && onComplete()
        safeCancel()
    }

    /**
     * Animation interrupt callback.
     */
    return {
        then(resolve: VoidFunction, reject?: VoidFunction) {
            return currentFinishedPromise.then(resolve, reject)
        },
        get time() {
            return millisecondsToSeconds(animation.currentTime || 0)
        },
        set time(newTime: number) {
            animation.currentTime = secondsToMilliseconds(newTime)
        },
        get speed() {
            return animation.playbackRate
        },
        set speed(newSpeed: number) {
            animation.playbackRate = newSpeed
        },
        play: () => animation.play(),
        pause: () => animation.pause(),
        stop: () => {
            if (animation.playState === "idle") return

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
            safeCancel()
        },
        complete: () => animation.finish(),
        cancel: safeCancel,
    }
}
