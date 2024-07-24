import { MotionProps } from "../../../motion/types"
import { HTMLRenderState } from "../types"
import { ResolvedValues } from "../../types"
import { buildTransform } from "./build-transform"
import { isCSSVariableName } from "../../dom/utils/is-css-variable"
import { transformProps } from "./transform"
import { getValueAsType } from "../../dom/value-types/get-as-type"
import { numberValueTypes } from "../../dom/value-types/number"

export function buildHTMLStyles(
    state: HTMLRenderState,
    latestValues: ResolvedValues,
    transformTemplate?: MotionProps["transformTemplate"]
) {
    const { style, vars, transform, transformOrigin } = state

    // Track whether we encounter any transform or transformOrigin values.
    let hasTransform = false
    let hasTransformOrigin = false

    // Does the calculated transform essentially equal "none"?
    let transformIsNone = true

    /**
     * Loop over all our latest animated values and decide whether to handle them
     * as a style or CSS variable.
     *
     * Transforms and transform origins are kept separately for further processing.
     */
    for (const key in latestValues) {
        const value = latestValues[key]

        /**
         * If this is a CSS variable we don't do any further processing.
         */
        if (isCSSVariableName(key)) {
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

            // If we already know we have a non-default transform, early return
            if (!transformIsNone) continue

            // Otherwise check to see if this is a default transform
            if (value !== (valueType.default || 0)) transformIsNone = false
        } else if (key.startsWith("origin")) {
            // If this is a transform origin, flag and enable further transform-origin processing
            hasTransformOrigin = true
            transformOrigin[key as keyof typeof transformOrigin] = valueAsType
        } else {
            style[key] = valueAsType
        }
    }

    if (!latestValues.transform) {
        if (hasTransform || transformTemplate) {
            style.transform = buildTransform(
                state.transform,
                transformIsNone,
                transformTemplate
            )
        } else if (style.transform) {
            /**
             * If we have previously created a transform but currently don't have any,
             * reset transform style to none.
             */
            style.transform = "none"
        }
    }

    /**
     * Build a transformOrigin style. Uses the same defaults as the browser for
     * undefined origins.
     */
    if (hasTransformOrigin) {
        const {
            originX = "50%",
            originY = "50%",
            originZ = 0,
        } = transformOrigin
        style.transformOrigin = `${originX} ${originY} ${originZ}`
    }
}
