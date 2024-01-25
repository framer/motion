import { Transition } from "../../types"
import { secondsToMilliseconds } from "../../utils/time-conversion"
import type { MotionValue, StartAnimation } from "../../value"
import { getDefaultTransition } from "../utils/default-transitions"
import { getValueTransition, isTransitionDefined } from "../utils/transitions"
import { animateValue } from "../animators/js"
import { AnimationPlaybackControls, ValueAnimationOptions } from "../types"
import type { UnresolvedKeyframes } from "../../render/utils/KeyframesResolver"
import { MotionGlobalConfig } from "../../utils/GlobalConfig"
import { instantAnimationState } from "../../utils/use-instant-transition-state"
import { createAcceleratedAnimation } from "../animators/waapi/create-accelerated-animation"
import type { VisualElement } from "../../render/VisualElement"

function makeTransitionInstant(options: ValueAnimationOptions<any>) {
    options.duration = 0
    options.type = "keyframes"
}

export const animateMotionValue = <V extends string | number>(
    name: string,
    value: MotionValue<V>,
    target: V | UnresolvedKeyframes<V>,
    transition: Transition & { elapsed?: number; isHandoff?: boolean } = {},
    element?: VisualElement<any>
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
            motionValue: value,
            element,
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

        if ((options as any).type === false) {
            makeTransitionInstant(options)
        }

        if (
            MotionGlobalConfig.skipAnimations ||
            instantAnimationState.current
        ) {
            makeTransitionInstant(options)
            options.delay = 0
        }

        if (options.from !== undefined) {
            options.keyframes[0] = options.from
        }

        /**
         * Animate via WAAPI if possible.
         */
        if (
            /**
             * If this is a handoff animation, the optimised animation will be running via
             * WAAPI. Therefore, this animation must be JS to ensure it runs "under" the
             * optimised animation.
             */
            !transition.isHandoff &&
            value.owner &&
            value.owner.current instanceof HTMLElement &&
            /**
             * If we're outputting values to onUpdate then we can't use WAAPI as there's
             * no way to read the value from WAAPI every frame.
             */
            !value.owner.getProps().onUpdate
        ) {
            const acceleratedAnimation = createAcceleratedAnimation(
                value,
                name,
                options
            )

            if (acceleratedAnimation) return acceleratedAnimation
        }

        return animateValue(options)
    }
}
