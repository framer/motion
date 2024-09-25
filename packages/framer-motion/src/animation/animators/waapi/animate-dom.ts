import { resolveElements } from "../../../render/dom/utils/resolve-element"
import { invariant } from "../../../utils/errors"
import { secondsToMilliseconds } from "../../../utils/time-conversion"
import { GroupPlaybackControls } from "../../GroupPlaybackControls"
import {
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
} from "../../types"
import { getValueTransition } from "../../utils/transitions"
import { NativeAnimation } from "./NativeAnimation"

export function animateElements(
    elementOrSelector: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: DynamicAnimationOptions,
    scope?: AnimationScope
) {
    const elements = resolveElements(elementOrSelector, scope)
    const numElements = elements.length

    invariant(Boolean(numElements), "No valid element provided.")

    const animations: AnimationPlaybackControls[] = []

    for (let i = 0; i < numElements; i++) {
        const element = elements[i]
        const elementTransition = { ...options }

        /**
         * Resolve stagger function if provided.
         */
        if (typeof elementTransition.delay === "function") {
            elementTransition.delay = elementTransition.delay(i, numElements)
        }

        for (const valueName in keyframes) {
            const valueKeyframes =
                keyframes[valueName as keyof typeof keyframes]!
            const valueOptions = {
                ...getValueTransition(options as any, valueName),
            }

            if (valueOptions.duration) {
                valueOptions.duration = secondsToMilliseconds(
                    valueOptions.duration
                )
            }
            if (valueOptions.delay) {
                valueOptions.delay = secondsToMilliseconds(
                    valueOptions.delay || 0
                )
            }

            animations.push(
                new NativeAnimation(
                    element,
                    valueName,
                    valueKeyframes,
                    valueOptions
                )
            )
        }
    }

    return animations
}

export const createScopedWaapiAnimate = (scope?: AnimationScope) => {
    function scopedAnimate(
        elementOrSelector: ElementOrSelector,
        keyframes: DOMKeyframesDefinition,
        options?: DynamicAnimationOptions
    ) {
        return new GroupPlaybackControls(
            animateElements(
                elementOrSelector,
                keyframes as DOMKeyframesDefinition,
                options,
                scope
            )
        )
    }

    return scopedAnimate
}

export const animateStyle = /*@__PURE__*/ createScopedWaapiAnimate()
