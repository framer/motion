import { resolveElements } from "../../../render/dom/utils/resolve-element"
import { invariant } from "../../../utils/errors"
import { secondsToMilliseconds } from "../../../utils/time-conversion"
import {
    AnimationPlaybackControls,
    AnimationScope,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
} from "../../types"
import { getValueTransition } from "../../utils/get-value-transition"
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

            valueOptions.duration = secondsToMilliseconds(
                valueOptions.duration || 0
            )
            valueOptions.delay = secondsToMilliseconds(valueOptions.delay || 0)

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
