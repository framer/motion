import { transformProps } from "../../render/html/utils/transform"
import type { AnimationTypeState } from "../../render/utils/animation-state"
import type { VisualElement } from "../../render/VisualElement"
import type { TargetAndTransition } from "../../types"
import type { VisualElementAnimationOptions } from "./types"
import { animateMotionValue } from "./motion-value"
import { setTarget } from "../../render/utils/setters"
import { AnimationPlaybackControls } from "../types"
import { getValueTransition } from "../utils/transitions"
import { frame } from "../../frameloop"
import { getOptimisedAppearId } from "../optimized-appear/get-appear-id"
import { addValueToWillChange } from "../../value/use-will-change/add-will-change"
import { time } from "../../frameloop/sync-time"

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
    targetAndTransition: TargetAndTransition,
    { delay = 0, transitionOverride, type }: VisualElementAnimationOptions = {}
): AnimationPlaybackControls[] {
    let {
        transition = visualElement.getDefaultTransition(),
        transitionEnd,
        ...target
    } = targetAndTransition

    if (transitionOverride) transition = transitionOverride

    const animations: AnimationPlaybackControls[] = []

    const animationTypeState =
        type &&
        visualElement.animationState &&
        visualElement.animationState.getState()[type]

    for (const key in target) {
        const value = visualElement.getValue(
            key,
            visualElement.latestValues[key] ?? null
        )
        const valueTarget = target[key as keyof typeof target]

        if (
            valueTarget === undefined ||
            (animationTypeState &&
                shouldBlockAnimation(animationTypeState, key))
        ) {
            continue
        }

        const valueTransition = {
            delay,
            elapsed: 0,
            ...getValueTransition(transition || {}, key),
        }

        /**
         * If this is the first time a value is being animated, check
         * to see if we're handling off from an existing animation.
         */
        if (window.MotionHandoffAnimation) {
            const appearId = getOptimisedAppearId(visualElement)

            if (appearId) {
                const handoffInfo = window.MotionHandoffAnimation(
                    appearId,
                    key,
                    frame
                )

                if (handoffInfo !== null) {
                    const { elapsed, startTime } = handoffInfo
                    valueTransition.isHandoff = true
                    valueTransition.elapsed = elapsed
                    if (startTime) valueTransition.startTime = startTime
                }
            }
        }

        value.start(
            animateMotionValue(
                key,
                value,
                valueTarget,
                visualElement.shouldReduceMotion && transformProps.has(key)
                    ? { type: false }
                    : valueTransition,
                visualElement,
                addValueToWillChange(visualElement, key)
            )
        )

        const animation = value.animation

        if (animation) {
            animations.push(animation)
        }
    }

    if (transitionEnd) {
        Promise.all(animations).then(() => {
            frame.update(() => {
                transitionEnd && setTarget(visualElement, transitionEnd)
            })
        })
    }

    return animations
}
