import { MotionProps } from "../../../motion/types"
import { HTMLRenderState } from "../types"
import { ResolvedValues } from "../../types"
import { DOMVisualElementOptions } from "../../dom/types"
import { buildTransform, buildTransformOrigin } from "./build-transform"
import { isCSSVariable } from "../../dom/utils/is-css-variable"
import { transformProps, transformOriginProps } from "./transform"
import { getValueAsType } from "../../dom/value-types/get-as-type"
import { numberValueTypes } from "../../dom/value-types/number"

export function buildHTMLStyles(
    state: HTMLRenderState,
    latestValues: ResolvedValues,
    options: DOMVisualElementOptions,
    transformTemplate?: MotionProps["transformTemplate"]
) {
    const { style, vars, transform, transformKeys, transformOrigin } = state

    // Empty the transformKeys array. As we're throwing out refs to its items
    // this might not be as cheap as suspected. Maybe using the array as a buffer
    // with a manual incrementation would be better.
    transformKeys.length = 0

    // Track whether we encounter any transform or transformOrigin values.
    let hasTransform = false
    let hasTransformOrigin = false

    // Does the calculated transform essentially equal "none"?
    let transformIsNone = true

    /**
     * Loop over all our latest animated values and decide whether to handle them
     * as a style or CSS variable.
     *
     * Transforms and transform origins are kept seperately for further processing.
     */
    for (const key in latestValues) {
        const value = latestValues[key]

        /**
         * If this is a CSS variable we don't do any further processing.
         */
        if (isCSSVariable(key)) {
            vars[key] = value
            continue
        }

        // Convert the value to its default value type, ie 0 -> "0px"
        const valueType = numberValueTypes[key]
        const valueAsType = getValueAsType(value, valueType)

        if (transformProps.has(key)) {
            // If this is a transform, flag to enable further transform processing
            hasTransform = true
            transform[key] = valueAsType
            transformKeys.push(key)

            // If we already know we have a non-default transform, early return
            if (!transformIsNone) continue

            // Otherwise check to see if this is a default transform
            if (value !== (valueType.default ?? 0)) transformIsNone = false
        } else if (transformOriginProps.has(key)) {
            transformOrigin[key] = valueAsType

            // If this is a transform origin, flag and enable further transform-origin processing
            hasTransformOrigin = true
        } else {
            style[key] = valueAsType
        }
    }

    if (hasTransform) {
        style.transform = buildTransform(
            state,
            options,
            transformIsNone,
            transformTemplate
        )
    } else if (transformTemplate) {
        style.transform = transformTemplate({}, "")
    } else if (!latestValues.transform && style.transform) {
        style.transform = "none"
    }

    if (hasTransformOrigin) {
        style.transformOrigin = buildTransformOrigin(transformOrigin)
    }
}
