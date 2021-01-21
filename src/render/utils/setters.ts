import { invariant } from "hey-listen"
import { complex } from "style-value-types"
import {
    Target,
    TargetAndTransition,
    TargetResolver,
    TargetWithKeyframes,
    Transition,
} from "../../types"
import { isNumericalString } from "../../utils/is-numerical-string"
import { resolveFinalValueInKeyframes } from "../../utils/resolve-value"
import { motionValue } from "../../value"
import { findValueType, getAnimatableNone } from "../dom/utils/value-types"
import { ResolvedValues, VisualElement } from "../types"
import { AnimationDefinition } from "./animation"
import { resolveVariant } from "./variants"

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
    let { transitionEnd = {}, transition = {}, ...target } = resolved
        ? visualElement.makeTargetAnimatable(resolved, false)
        : {}

    target = { ...target, ...transitionEnd }

    for (const key in target) {
        const value = resolveFinalValueInKeyframes(target[key])
        setMotionValue(visualElement, key, value as string | number)
    }
}

function setVariants(visualElement: VisualElement, variantLabels: string[]) {
    const reversedLabels = [...variantLabels].reverse()

    reversedLabels.forEach((key) => {
        const variant = visualElement.getVariant(key)
        variant && setTarget(visualElement, variant)

        visualElement.variantChildren?.forEach((child) => {
            setVariants(child, variantLabels)
        })
    })
}

export function setValues(
    visualElement: VisualElement,
    definition: AnimationDefinition
) {
    if (Array.isArray(definition)) {
        return setVariants(visualElement, definition)
    } else if (typeof definition === "string") {
        return setVariants(visualElement, [definition])
    } else {
        setTarget(visualElement, definition as any)
    }
}

export function checkTargetForNewValues(
    visualElement: VisualElement,
    target: TargetWithKeyframes,
    origin: ResolvedValues
) {
    const newValueKeys = Object.keys(target).filter(
        (key) => !visualElement.hasValue(key)
    )

    const numNewValues = newValueKeys.length
    if (!numNewValues) return

    for (let i = 0; i < numNewValues; i++) {
        const key = newValueKeys[i]
        const targetValue = target[key]
        let value: string | number | null = null

        // If this is a keyframes value, we can attempt to use the first value in the
        // array as that's going to be the first value of the animation anyway
        if (Array.isArray(targetValue)) {
            value = targetValue[0]
        }

        // If it isn't a keyframes or the first keyframes value was set as `null`, read the
        // value from the DOM. It might be worth investigating whether to check props (for SVG)
        // or props.style (for HTML) if the value exists there before attempting to read.
        if (value === null) {
            const readValue = origin[key] ?? visualElement.readValue(key)
            value = readValue !== undefined ? readValue : target[key]

            invariant(
                value !== null,
                `No initial value for "${key}" can be inferred. Ensure an initial value for "${key}" is defined on the component.`
            )
        }

        if (typeof value === "string" && isNumericalString(value)) {
            // If this is a number read as a string, ie "0" or "200", convert it to a number
            value = parseFloat(value)
        } else if (!findValueType(value) && complex.test(targetValue)) {
            value = getAnimatableNone(key, targetValue)
        }

        visualElement.addValue(key, motionValue(value))
        ;(origin as any)[key] ??= value
        visualElement.setBaseTarget(key, value)
    }
}

export function getOriginFromTransition(key: string, transition: Transition) {
    if (!transition) return
    const valueTransition =
        transition[key] || transition["default"] || transition
    return valueTransition.from
}

export function getOrigin(
    target: Target,
    transition: Transition,
    visualElement: VisualElement
) {
    const origin: Target = {}

    for (const key in target) {
        origin[key] =
            getOriginFromTransition(key, transition) ??
            visualElement.getValue(key)?.get()
    }

    return origin
}
