import { TargetAndTransition, TargetResolver } from "../../types"
import { resolveFinalValueInKeyframes } from "../../utils/resolve-value"
import { motionValue } from "../../value"
import type { VisualElement } from "../VisualElement"
import { resolveVariant } from "./resolve-dynamic-variants"

/**
 * Set VisualElement's MotionValue, creating a new MotionValue for it if
 * it doesn't exist.
 */
function setMotionValue(
    visualElement: VisualElement,
    key: string,
    value: string | number
) {
    if (visualElement.hasValue(key)) {
        visualElement.getValue(key)!.set(value)
    } else {
        visualElement.addValue(key, motionValue(value))
    }
}

export function setTarget(
    visualElement: VisualElement,
    definition: string | TargetAndTransition | TargetResolver
) {
    const resolved = resolveVariant(visualElement, definition)
    let {
        transitionEnd = {},
        transitionFrom,
        transition = {},
        ...target
    } = resolved || {}

    target = { ...target, ...transitionEnd }

    for (const key in target) {
        const value = resolveFinalValueInKeyframes(
            target[key as keyof typeof target] as any
        )
        setMotionValue(visualElement, key, value as string | number)
    }
}
