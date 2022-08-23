import type { MotionProps } from "../../motion/types"
import type { TargetAndTransition, TargetResolver } from "../../types"
import type { ResolvedValues } from "../types"

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
