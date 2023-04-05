import { resolveVariant } from "../../render/utils/resolve-dynamic-variants"
import { VisualElement } from "../../render/VisualElement"
import { AnimationDefinition } from "../types"
import { VisualElementAnimationOptions } from "./types"
import { animateTarget } from "./visual-element-target"
import { animateVariant } from "./visual-element-variant"

export function animateVisualElement(
    visualElement: VisualElement,
    definition: AnimationDefinition,
    options: VisualElementAnimationOptions = {}
) {
    visualElement.notify("AnimationStart", definition)

    let preparedAnimations: (() => any)[] = []

    if (Array.isArray(definition)) {
        preparedAnimations = definition.map((variant) =>
            animateVariant(visualElement, variant, options)
        )
    } else if (typeof definition === "string") {
        preparedAnimations = [
            animateVariant(visualElement, definition, options),
        ]
    } else {
        const resolvedDefinition =
            typeof definition === "function"
                ? resolveVariant(visualElement, definition, options.custom)
                : definition

        preparedAnimations = [
            animateTarget(visualElement, resolvedDefinition, options),
        ]
    }

    return () => {
        return Promise.all(
            preparedAnimations.map((animation) => animation())
        ).then(() => {
            visualElement.notify("AnimationComplete", definition)
        })
    }
}
