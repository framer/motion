import { frame } from "../../frameloop"
import { transformProps } from "../../render/html/utils/transform"
import type { AnimationTypeState } from "../../render/utils/animation-state"
import type { VisualElement } from "../../render/VisualElement"
import type { TargetAndTransition, Transition } from "../../types"
import { optimizedAppearDataAttribute } from "../optimized-appear/data-id"
import type { VisualElementAnimationOptions } from "./types"
import { animateMotionValue } from "./motion-value"
import { isWillChangeMotionValue } from "../../value/use-will-change/is"
import { setTarget } from "../../render/utils/setters"
import { AnimationPlaybackControls } from "../types"

/**
 * Decide whether we should block this animation. Previously, we achieved this
 * just by checking whether the key was listed in protectedKeys, but this
 * posed problems if an animation was triggered by afterChildren and protectedKeys
 * had been set to true in the meantime.
 */
function shouldBlockAnimation(
    { protectedKeys, needsAnimating }: AnimationTypeState,
    key: string
) {
    const shouldBlock =
        protectedKeys.hasOwnProperty(key) && needsAnimating[key] !== true

    needsAnimating[key] = false
    return shouldBlock
}

export function animateTarget(
    visualElement: VisualElement,
    definition: TargetAndTransition,
    { delay = 0, transitionOverride, type }: VisualElementAnimationOptions = {}
): AnimationPlaybackControls[] {
    let {
        transition = visualElement.getDefaultTransition(),
        transitionEnd,
        ...target
    } = visualElement.makeTargetAnimatable(definition)

    const willChange = visualElement.getValue("willChange")

    if (transitionOverride) transition = transitionOverride

    const animations: AnimationPlaybackControls[] = []

    const animationTypeState =
        type &&
        visualElement.animationState &&
        visualElement.animationState.getState()[type]

    for (const key in target) {
        const value = visualElement.getValue(key)
        const valueTarget = target[key]

        if (
            !value ||
            valueTarget === undefined ||
            (animationTypeState &&
                shouldBlockAnimation(animationTypeState, key))
        ) {
            continue
        }

        const valueTransition = {
            delay,
            syncStart: false,
            elapsed: 0,
            ...transition,
        }

        /**
         * If this is the first time a value is being animated, check
         * to see if we're handling off from an existing animation.
         */
        if (window.HandoffAppearAnimations && !value.hasAnimated) {
            const appearId =
                visualElement.getProps()[optimizedAppearDataAttribute]

            if (appearId) {
                valueTransition.elapsed = window.HandoffAppearAnimations(
                    appearId,
                    key,
                    value,
                    frame
                )
                valueTransition.syncStart = true
            }
        }

        value.start(
            animateMotionValue(
                key,
                value,
                valueTarget,
                visualElement.shouldReduceMotion && transformProps.has(key)
                    ? { type: false }
                    : valueTransition
            )
        )

        const animation = value.animation!

        if (isWillChangeMotionValue(willChange)) {
            willChange.add(key)
            animation.then(() => willChange.remove(key))
        }

        animations.push(animation)
    }

    if (transitionEnd) {
        Promise.all(animations).then(() => {
            transitionEnd && setTarget(visualElement, transitionEnd)
        })
    }

    return animations
}
