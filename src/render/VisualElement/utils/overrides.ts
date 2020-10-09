import { VisualElement } from "../"
import { Target } from "../../../types"
import {
    animateTarget,
    AnimationDefinition,
    startVisualElementAnimation,
} from "./animation"

export function setOverride(
    visualElement: VisualElement,
    definition: AnimationDefinition,
    index: number
) {
    visualElement.overrides[index] = definition
    visualElement.variantChildren?.forEach((child) => {
        setOverride(child, definition, index)
    })
}

export function startOverride(visualElement: VisualElement, index: number) {
    const override = visualElement.overrides[index]

    if (override) {
        return startVisualElementAnimation(visualElement, override, {
            priority: index,
        })
    }
}

export function clearOverride(visualElement: VisualElement, index: number) {
    visualElement.variantChildrenOrder?.forEach((child) => {
        clearOverride(child, index)
    })

    const override = visualElement.overrides[index]
    if (!override) return

    visualElement.activeOverrides.delete(index)
    const highest = getHighestOverridePriortiy(visualElement)

    visualElement.resetIsAnimating()

    if (highest) {
        const highestOverride = visualElement.overrides[highest]
        highestOverride && startOverride(visualElement, highest)
    }

    // Figure out which remaining values were affected by the override and animate those
    const overrideTarget = visualElement.resolvedOverrides[index]
    if (!overrideTarget) return

    const remainingValues: Target = {}

    for (const key in visualElement.baseTarget) {
        if (overrideTarget[key] !== undefined) {
            remainingValues[key] = visualElement.baseTarget[key]
        }
    }

    visualElement.onAnimationStart()
    animateTarget(visualElement, remainingValues).then(() => {
        visualElement.onAnimationComplete()
    })
}

export function getHighestOverridePriortiy(visualElement: VisualElement) {
    if (!visualElement.activeOverrides.size) return 0
    return Math.max(...Array.from(visualElement.activeOverrides))
}
