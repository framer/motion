import { warning } from "../../utils/errors"
import { ResolvedValueTarget, Transition } from "../../types"
import { secondsToMilliseconds } from "../../utils/time-conversion"
import { instantAnimationState } from "../../utils/use-instant-transition-state"
import type { MotionValue, StartAnimation } from "../../value"
import { createAcceleratedAnimation } from "../animators/waapi/create-accelerated-animation"
import { createInstantAnimation } from "../animators/instant"
import { getDefaultTransition } from "../utils/default-transitions"
import { isAnimatable } from "../utils/is-animatable"
import { getKeyframes } from "../utils/keyframes"
import { getValueTransition, isTransitionDefined } from "../utils/transitions"
import { animateValue } from "../animators/js"
import { AnimationPlaybackControls, ValueAnimationOptions } from "../types"
import { MotionGlobalConfig } from "../../utils/GlobalConfig"
import { VisualElement } from "../../render/VisualElement"

export const animateMotionValue = (
    name: string,
    value: MotionValue,
    target: ResolvedValueTarget,
    transition: Transition & { elapsed?: number; isHandoff?: boolean } = {},
    visualElement: VisualElement
): StartAnimation => {
    return (onComplete: VoidFunction): AnimationPlaybackControls => {
        const valueTransition = getValueTransition(transition, name) || {}

        /**
         * Most transition values are currently completely overwritten by value-specific
         * transitions. In the future it'd be nicer to blend these transitions. But for now
         * delay actually does inherit from the root transition if not value-specific.
         */
        const delay = valueTransition.delay || transition.delay || 0

        /**
         * Elapsed isn't a public transition option but can be passed through from
         * optimized appear effects in milliseconds.
         */
        let { elapsed = 0 } = transition
        elapsed = elapsed - secondsToMilliseconds(delay)

        let options: ValueAnimationOptions = {
            keyframes: Array.isArray(target) ? target : [null, target],
            velocity: value.getVelocity(),
            ease: "easeOut",
            ...valueTransition,
            delay: -elapsed,
            onUpdate: (v) => {
                value.set(v)
                valueTransition.onUpdate && valueTransition.onUpdate(v)
            },
            onComplete: () => {
                onComplete()
                valueTransition.onComplete && valueTransition.onComplete()
            },
            name,
            visualElement,
        }

        /**
         * If there's no transition defined for this value, we can generate
         * unqiue transition settings for this value.
         */
        if (!isTransitionDefined(valueTransition)) {
            options = {
                ...options,
                ...getDefaultTransition(name, options),
            }
        }

        /**
         * Both WAAPI and our internal animation functions use durations
         * as defined by milliseconds, while our external API defines them
         * as seconds.
         */
        if (options.duration) {
            options.duration = secondsToMilliseconds(options.duration)
        }
        if (options.repeatDelay) {
            options.repeatDelay = secondsToMilliseconds(options.repeatDelay)
        }

        return animateValue(options)
    }
}

// export const animateMotionValue = (
//     valueName: string,
//     value: MotionValue,
//     target: ResolvedValueTarget,
//     transition: Transition & { elapsed?: number; isHandoff?: boolean } = {}
// ): StartAnimation => {
//     return (onComplete: VoidFunction): AnimationPlaybackControls => {

// /**
//  * Check if we're able to animate between the start and end keyframes,
//  * and throw a warning if we're attempting to animate between one that's
//  * animatable and another that isn't.
//  */
// const originKeyframe = keyframes[0]
// const targetKeyframe = keyframes[keyframes.length - 1]
// const isOriginAnimatable = isAnimatable(valueName, originKeyframe)
// const isTargetAnimatable = isAnimatable(valueName, targetKeyframe)
// warning(
//     isOriginAnimatable === isTargetAnimatable,
//     `You are trying to animate ${valueName} from "${originKeyframe}" to "${targetKeyframe}". ${originKeyframe} is not an animatable value - to enable this animation set ${originKeyframe} to a value animatable to ${targetKeyframe} via the \`style\` property.`
// )

// if (
//     !isOriginAnimatable ||
//     !isTargetAnimatable ||
//     instantAnimationState.current ||
//     valueTransition.type === false
// ) {
//     /**
//      * If we can't animate this value, or the global instant animation flag is set,
//      * or this is simply defined as an instant transition, return an instant transition.
//      */
//     return createInstantAnimation(
//         instantAnimationState.current
//             ? { ...options, delay: 0 }
//             : options
//     )
// }
// /**
//  * Animate via WAAPI if possible.
//  */
// if (
//     /**
//      * If this is a handoff animation, the optimised animation will be running via
//      * WAAPI. Therefore, this animation must be JS to ensure it runs "under" the
//      * optimised animation.
//      */
//     !transition.isHandoff &&
//     value.owner &&
//     value.owner.current instanceof HTMLElement &&
//     /**
//      * If we're outputting values to onUpdate then we can't use WAAPI as there's
//      * no way to read the value from WAAPI every frame.
//      */
//     !value.owner.getProps().onUpdate
// ) {
//     const acceleratedAnimation = createAcceleratedAnimation(
//         value,
//         valueName,
//         options
//     )
//     if (acceleratedAnimation) return acceleratedAnimation
// }
// /**
//  * If we didn't create an accelerated animation, create a JS animation
//  */
// return animateValue(options)
//     }
// }
