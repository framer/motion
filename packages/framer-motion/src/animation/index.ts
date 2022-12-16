import { warning } from "hey-listen"
import { ResolvedValueTarget, Transition } from "../types"
import { secondsToMilliseconds } from "../utils/time-conversion"
import { instantAnimationState } from "../utils/use-instant-transition-state"
import type { MotionValue, StartAnimation } from "../value"
import { createAcceleratedAnimation } from "./waapi/create-accelerated-animation"
import { createInstantAnimation } from "./create-instant-animation"
import { animate } from "./legacy-popmotion"
import { inertia } from "./legacy-popmotion/inertia"
import { AnimationOptions } from "./types"
import { getDefaultTransition } from "./utils/default-transitions"
import { isAnimatable } from "./utils/is-animatable"
import { getKeyframes } from "./utils/keyframes"
import { getValueTransition, isTransitionDefined } from "./utils/transitions"
import { supports } from "./waapi/supports"
import { supportedWaapiEasing } from "./waapi/easing"

/**
 * A list of values that can be hardware-accelerated.
 */
const acceleratedValues = new Set<string>(["opacity"])

export const createMotionValueAnimation = (
    valueName: string,
    value: MotionValue,
    target: ResolvedValueTarget,
    transition: Transition & { elapsed?: number } = {}
): StartAnimation => {
    return (onComplete: VoidFunction) => {
        const valueTransition = getValueTransition(transition, valueName) || {}

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

        const keyframes = getKeyframes(
            value,
            valueName,
            target,
            valueTransition
        )

        /**
         * Check if we're able to animate between the start and end keyframes,
         * and throw a warning if we're attempting to animate between one that's
         * animatable and another that isn't.
         */
        const originKeyframe = keyframes[0]
        const targetKeyframe = keyframes[keyframes.length - 1]
        const isOriginAnimatable = isAnimatable(valueName, originKeyframe)
        const isTargetAnimatable = isAnimatable(valueName, targetKeyframe)

        warning(
            isOriginAnimatable === isTargetAnimatable,
            `You are trying to animate ${valueName} from "${originKeyframe}" to "${targetKeyframe}". ${originKeyframe} is not an animatable value - to enable this animation set ${originKeyframe} to a value animatable to ${targetKeyframe} via the \`style\` property.`
        )

        let options: AnimationOptions = {
            keyframes,
            velocity: value.getVelocity(),
            ...valueTransition,
            elapsed,
            onUpdate: (v) => {
                value.set(v)
                valueTransition.onUpdate && valueTransition.onUpdate(v)
            },
            onComplete: () => {
                onComplete()
                valueTransition.onComplete && valueTransition.onComplete()
            },
        }

        if (
            !isOriginAnimatable ||
            !isTargetAnimatable ||
            instantAnimationState.current ||
            valueTransition.type === false
        ) {
            /**
             * If we can't animate this value, or the global instant animation flag is set,
             * or this is simply defined as an instant transition, return an instant transition.
             */
            return createInstantAnimation(options)
        } else if (valueTransition.type === "inertia") {
            /**
             * If this is an inertia animation, we currently don't support pre-generating
             * keyframes for this as such it must always run on the main thread.
             */
            const animation = inertia(options)

            return () => animation.stop()
        }

        /**
         * If there's no transition defined for this value, we can generate
         * unqiue transition settings for this value.
         */
        if (!isTransitionDefined(valueTransition)) {
            options = {
                ...options,
                ...getDefaultTransition(valueName, options),
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

        const visualElement = value.owner
        const element = visualElement && visualElement.current

        /**
         * WAAPI doesn't support all the same easings as Framer Motion. It doesn't
         * support JavaScript functions. Otherwise, if defined as a string, we can
         * only approximate some easings with cubic-bezier().
         *
         * In the future it will be possible to support these by approximating with linear().
         */
        let supportsEasing = true
        if (
            typeof options.ease === "function" ||
            (typeof options.ease === "string" &&
                supportedWaapiEasing[options.ease])
        ) {
            supportsEasing = false
        }

        const canAccelerateAnimation =
            supports.waapi() &&
            acceleratedValues.has(valueName) &&
            !options.repeatDelay &&
            options.repeatType !== "mirror" &&
            options.damping !== 0 &&
            supportsEasing &&
            visualElement &&
            element instanceof HTMLElement &&
            !visualElement.getProps().onUpdate

        if (canAccelerateAnimation) {
            /**
             * If this animation is capable of being run via WAAPI, then do so.
             */
            return createAcceleratedAnimation(value, valueName, options)
        } else {
            /**
             * Otherwise, fall back to the main thread.
             */
            const animation = animate(options)

            return () => animation.stop()
        }
    }
}
