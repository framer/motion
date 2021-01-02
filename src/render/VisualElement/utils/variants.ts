import { VisualElement } from "../"
import { TargetAndTransition, TargetResolver } from "../../../types"

/**
 * Decides if the supplied variable is an array of variant labels
 */
export function isVariantLabels(v: unknown): v is string[] {
    return Array.isArray(v)
}

/**
 * Decides if the supplied variable is variant label
 */
export function isVariantLabel(v: unknown): v is string | string[] {
    return typeof v === "string" || isVariantLabels(v)
}

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
    definition?: string | TargetAndTransition | TargetResolver,
    custom?: any
) {
    if (typeof definition === "string") {
        definition = visualElement.getVariant(definition)
    }

    return typeof definition === "function"
        ? definition(
              custom ?? visualElement.getVariantPayload(),
              getCurrent(visualElement),
              getVelocity(visualElement)
          )
        : definition
}
