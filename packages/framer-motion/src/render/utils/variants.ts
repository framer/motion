import { isAnimationControls } from "../../animation/utils/is-animation-controls"
import { MotionProps } from "../../motion/types"
import { TargetAndTransition, TargetResolver } from "../../types"
import { ResolvedValues, VisualElement } from "../types"

/**
 * Decides if the supplied variable is variant label
 */
export function isVariantLabel(v: unknown): v is string | string[] {
    return typeof v === "string" || Array.isArray(v)
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

export function resolveVariantFromProps(
    props: MotionProps,
    definition: TargetAndTransition | TargetResolver,
    custom?: any,
    currentValues?: ResolvedValues,
    currentVelocity?: ResolvedValues
): TargetAndTransition
export function resolveVariantFromProps(
    props: MotionProps,
    definition?: string | TargetAndTransition | TargetResolver,
    custom?: any,
    currentValues?: ResolvedValues,
    currentVelocity?: ResolvedValues
): undefined | TargetAndTransition
export function resolveVariantFromProps(
    props: MotionProps,
    definition?: string | TargetAndTransition | TargetResolver,
    custom?: any,
    currentValues: ResolvedValues = {},
    currentVelocity: ResolvedValues = {}
) {
    /**
     * If the variant definition is a function, resolve.
     */
    if (typeof definition === "function") {
        definition = definition(
            custom !== undefined ? custom : props.custom,
            currentValues,
            currentVelocity
        )
    }

    /**
     * If the variant definition is a variant label, or
     * the function returned a variant label, resolve.
     */
    if (typeof definition === "string") {
        definition = props.variants && props.variants[definition]
    }

    /**
     * At this point we've resolved both functions and variant labels,
     * but the resolved variant label might itself have been a function.
     * If so, resolve. This can only have returned a valid target object.
     */
    if (typeof definition === "function") {
        definition = definition(
            custom !== undefined ? custom : props.custom,
            currentValues,
            currentVelocity
        )
    }

    return definition
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

const variantProps = [
    "initial",
    "animate",
    "exit",
    "whileHover",
    "whileDrag",
    "whileTap",
    "whileFocus",
    "whileInView",
]

export function checkIfControllingVariants(props: MotionProps) {
    return (
        isAnimationControls(props.animate) ||
        variantProps.some((name) => isVariantLabel(props[name]))
    )
}

export function checkIfVariantNode(props: MotionProps) {
    return Boolean(checkIfControllingVariants(props) || props.variants)
}
