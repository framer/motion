import { EasingDefinition } from "../../../easing/types"
import { frame, cancelFrame } from "../../../frameloop"
import type { VisualElement } from "../../../render/VisualElement"
import type { MotionValue } from "../../../value"
import { AnimationPlaybackControls, ValueAnimationOptions } from "../../types"
import { animateStyle } from "."
import { isWaapiSupportedEasing } from "./easing"
import { getFinalKeyframe } from "./utils/get-final-keyframe"
import { animateValue } from "../js"
import {
    millisecondsToSeconds,
    secondsToMilliseconds,
} from "../../../utils/time-conversion"
import { memo } from "../../../utils/memo"
import { noop } from "../../../utils/noop"
import {
    KeyframeResolver,
    ResolvedKeyframes,
    flushKeyframeResolvers,
} from "../../../render/utils/KeyframesResolver"
import { canAnimate } from "../utils/can-animate"
import { instantAnimationState } from "../../../utils/use-instant-transition-state"

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

export function createAcceleratedAnimation(
    value: MotionValue,
    valueName: string,
    {
        onUpdate,
        onComplete,
        element,
        name,
        motionValue,
        ...options
    }: ValueAnimationOptions
): AnimationPlaybackControls | false {
    const canAccelerateAnimation =
        supportsWaapi() &&
        acceleratedValues.has(valueName) &&
        !options.repeatDelay &&
        options.repeatType !== "mirror" &&
        options.damping !== 0 &&
        options.type !== "inertia"

    if (!canAccelerateAnimation) return false

    /**
     * TODO: Unify with js/index
     */
    // let hasStopped = false
    // let resolveFinishedPromise: VoidFunction
    // let currentFinishedPromise: Promise<void>

    /**
     * Cancelling an animation will write to the DOM. For safety we want to defer
     * this until the next `update` frame lifecycle. This flag tracks whether we
     * have a pending cancel, if so we shouldn't allow animations to finish.
     */
    let pendingCancel = false

    // /**
    //  * Resolve the current Promise every time we enter the
    //  * finished state. This is WAAPI-compatible behaviour.
    //  */
    // const updateFinishedPromise = () => {
    //     currentFinishedPromise = new Promise((resolve) => {
    //         resolveFinishedPromise = resolve
    //     })
    // }

    // // Create the first finished promise
    // updateFinishedPromise()

    let {
        keyframes: unresolvedKeyframes,
        duration = 300,
        ease,
        times,
    } = options

    let resolvedKeyframes: ResolvedKeyframes<any>

    let animation: Animation | undefined
    const createWaapiAnimation = (keyframes: ResolvedKeyframes<any>) => {
        // resolvedKeyframes = keyframes
        const finish = () => {
            if (pendingCancel) return
            value.set(getFinalKeyframe(keyframes, options))
            onComplete && onComplete()
            safeCancel()
        }

        // // if (!canAnimate(keyframes, valueName, options.type, options.velocity)) {
        // //     if (instantAnimationState.current || !options.delay) {
        // //         finish()
        // //         return
        // //     } else {
        // //         options.duration = 0
        // //     }
        // // }

        // /**
        //  * If this animation needs pre-generated keyframes then generate.
        //  */
        // if (requiresPregeneratedKeyframes(valueName, options)) {
        //     const sampleAnimation = animateValue({
        //         ...options,
        //         keyframes: resolvedKeyframes,
        //         repeat: 0,
        //         delay: 0,
        //     })
        //     let state = { done: false, value: keyframes[0] }
        //     const pregeneratedKeyframes: number[] = []

        //     /**
        //      * Bail after 20 seconds of pre-generated keyframes as it's likely
        //      * we're heading for an infinite loop.
        //      */
        //     let t = 0
        //     while (!state.done && t < maxDuration) {
        //         state = sampleAnimation.sample(t)
        //         pregeneratedKeyframes.push(state.value)
        //         t += sampleDelta
        //     }

        //     times = undefined
        //     keyframes = pregeneratedKeyframes
        //     duration = t - sampleDelta
        //     ease = "linear"
        // }

        // animation = animateStyle(
        //     (value.owner as VisualElement<HTMLElement>).current!,
        //     valueName,
        //     keyframes,
        //     {
        //         ...options,
        //         duration,
        //         /**
        //          * This function is currently not called if ease is provided
        //          * as a function so the cast is safe.
        //          *
        //          * However it would be possible for a future refinement to port
        //          * in easing pregeneration from Motion One for browsers that
        //          * support the upcoming `linear()` easing function.
        //          */
        //         ease: ease as EasingDefinition,
        //         times,
        //     }
        // )

        // animation.startTime = time.now()

        // /**
        //  * Prefer the `onfinish` prop as it's more widely supported than
        //  * the `finished` promise.
        //  *
        //  * Here, we synchronously set the provided MotionValue to the end
        //  * keyframe. If we didn't, when the WAAPI animation is finished it would
        //  * be removed from the element which would then revert to its old styles.
        //  */
        // animation.onfinish = finish
    }

    const cancelAnimation = () => {
        pendingCancel = false

        if (animation) {
            animation.cancel()
        } else {
            resolver.cancel()
        }
    }

    const safeCancel = () => {
        pendingCancel = true
        frame.update(cancelAnimation)
        resolveFinishedPromise()
        updateFinishedPromise()
    }

    // const resolver =
    //     element && name && motionValue
    //         ? element.resolveKeyframes(
    //               unresolvedKeyframes,
    //               createWaapiAnimation,
    //               name,
    //               motionValue
    //           )
    //         : new KeyframeResolver(
    //               unresolvedKeyframes,
    //               createWaapiAnimation,
    //               name,
    //               motionValue,
    //               element
    //           )

    /**
     * Animation interrupt callback.
     */
    const controls = {
        // then(resolve: VoidFunction, reject?: VoidFunction) {
        //     return currentFinishedPromise.then(resolve, reject)
        // },
        // attachTimeline(timeline: any) {
        //     if (!animation) flushKeyframeResolvers()

        //     animation!.timeline = timeline
        //     animation!.onfinish = null

        //     return noop<void>
        // },
        // get time() {
        //     if (!animation) flushKeyframeResolvers()
        //     return millisecondsToSeconds(animation!.currentTime || 0)
        // },
        // set time(newTime: number) {
        //     if (!animation) flushKeyframeResolvers()
        //     animation!.currentTime = secondsToMilliseconds(newTime)
        // },
        // get speed() {
        //     if (!animation) flushKeyframeResolvers()
        //     return animation!.playbackRate
        // },
        // set speed(newSpeed: number) {
        //     if (!animation) flushKeyframeResolvers()
        //     animation!.playbackRate = newSpeed
        // },
        // get duration() {
        //     // TODO allow async
        //     return millisecondsToSeconds(duration)
        // },
        play: () => {
            // if (!animation) flushKeyframeResolvers()
            // if (hasStopped) return
            // animation!.play()

            /**
             * Cancel any pending cancel tasks
             */
            cancelFrame(cancelAnimation)
        },
        // TODO allow async
        // pause: () => {
        //     if (!animation) flushKeyframeResolvers()
        //     animation!.pause()
        // },
        stop: () => {
            if (!animation) flushKeyframeResolvers()

            hasStopped = true
            if (animation!.playState === "idle") return

            /**
             * WAAPI doesn't natively have any interruption capabilities.
             *
             * Rather than read commited styles back out of the DOM, we can
             * create a renderless JS animation and sample it twice to calculate
             * its current value, "previous" value, and therefore allow
             * Motion to calculate velocity for any subsequent animation.
             */
            const { currentTime } = animation!

            if (currentTime) {
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
            safeCancel()
        },
        complete: () => {
            if (pendingCancel) return
            if (!animation) flushKeyframeResolvers()
            animation!.finish()
        },
        cancel: safeCancel,
    }

    return controls
}
