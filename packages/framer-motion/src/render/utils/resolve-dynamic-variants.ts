import { TargetAndTransition, TargetResolver } from "../../types"
import { VisualElement } from "../types"
import { resolveVariantFromProps } from "./resolve-variants"

/**
 * Creates an object containing the latest state of every MotionValue on a VisualElement
 */
function getCurrent(visualElement: VisualElement) {
    const current = {}
    visualElement.forEachValue((value, key) => (current[key] = value.get()))
    return current
}

/**
 * Creates an object containing the latest velocity of every MotionValue on a VisualElement
 */
function getVelocity(visualElement: VisualElement) {
    const velocity = {}
    visualElement.forEachValue(
        (value, key) => (velocity[key] = value.getVelocity())
    )
    return velocity
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
    const props = visualElement.getProps()
    return resolveVariantFromProps(
        props,
        definition,
        custom !== undefined ? custom : props.custom,
        getCurrent(visualElement),
        getVelocity(visualElement)
    )
}
