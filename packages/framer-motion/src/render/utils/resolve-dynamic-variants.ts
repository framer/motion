import { frame } from "../../frameloop"
import { TargetAndTransition, TargetResolver } from "../../types"
import type { VisualElement } from "../VisualElement"
import { resolveVariantFromProps } from "./resolve-variants"

let totalTime = 0

function log() {
    console.log(totalTime)
}

/**
 * Resovles a variant if it's a variant resolver
 */
export function resolveVariant(
    visualElement: VisualElement,
    definition: TargetAndTransition | TargetResolver,
    custom?: any
): TargetAndTransition
export function resolveVariant(
    visualElement: VisualElement,
    definition?: string | TargetAndTransition | TargetResolver,
    custom?: any
): TargetAndTransition | undefined
export function resolveVariant(
    visualElement: VisualElement,
    definition?: string | TargetAndTransition | TargetResolver,
    custom?: any
) {
    const startTime = performance.now()

    const props = visualElement.getProps()
    const variant = resolveVariantFromProps(
        props,
        definition,
        custom !== undefined ? custom : props.custom,
        visualElement
    )

    totalTime += performance.now() - startTime

    frame.postRender(log)
    return variant
}
