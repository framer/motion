import { MotionProps } from "../../../motion"
import { HTMLRenderState } from "../types"
import { ResolvedValues } from "../../types"
import { LayoutState, TargetProjection } from "../../utils/state"
import { valueScaleCorrection } from "../../dom/projection/scale-correction"
import { DOMVisualElementOptions } from "../../dom/types"
import {
    buildLayoutProjectionTransform,
    buildLayoutProjectionTransformOrigin,
    buildTransform,
    buildTransformOrigin,
} from "./build-transform"
import { isCSSVariable } from "../../dom/utils/is-css-variable"
import { isTransformOriginProp, isTransformProp } from "./transform"
import {
    getDefaultValueType,
    getValueAsType,
} from "../../dom/utils/value-types"

export function buildHTMLStyles(
    state: HTMLRenderState,
    latestValues: ResolvedValues,
    projection: TargetProjection | undefined,
    layoutState: LayoutState | undefined,
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
        const valueType = getDefaultValueType(key)
        const valueAsType = getValueAsType(value, valueType)

        if (isTransformProp(key)) {
            // If this is a transform, flag to enable further transform processing
            hasTransform = true
            transform[key] = valueAsType
            transformKeys.push(key)

            // If we already know we have a non-default transform, early return
            if (!transformIsNone) continue

            // Otherwise check to see if this is a default transform
            if (value !== (valueType.default ?? 0)) transformIsNone = false
        } else if (isTransformOriginProp(key)) {
            transformOrigin[key] = valueAsType

            // If this is a transform origin, flag and enable further transform-origin processing
            hasTransformOrigin = true
        } else {
            /**
             * If layout projection is on, and we need to perform scale correction for this
             * value type, perform it.
             */
            if (
                layoutState &&
                projection &&
                layoutState.isHydrated &&
                valueScaleCorrection[key]
            ) {
                const correctedValue = valueScaleCorrection[key].process(
                    value,
                    layoutState,
                    projection
                )

                /**
                 * Scale-correctable values can define a number of other values to break
                 * down into. For instance borderRadius needs applying to borderBottomLeftRadius etc
                 */
                const { applyTo } = valueScaleCorrection[key]
                if (applyTo) {
                    const num = applyTo.length
                    for (let i = 0; i < num; i++) {
                        style[applyTo[i]] = correctedValue
                    }
                } else {
                    style[key] = correctedValue
                }
            } else {
                style[key] = valueAsType
            }
        }
    }

    if (
        layoutState &&
        projection &&
        projection.isEnabled &&
        layoutState.isHydrated
    ) {
        style.transform = buildLayoutProjectionTransform(
            layoutState.deltaFinal,
            layoutState.treeScale,
            hasTransform ? transform : undefined
        )

        if (transformTemplate) {
            style.transform = transformTemplate(transform, style.transform)
        }

        style.transformOrigin = buildLayoutProjectionTransformOrigin(
            layoutState
        )
    } else {
        if (hasTransform) {
            style.transform = buildTransform(
                state,
                options,
                transformIsNone,
                transformTemplate
            )
        }

        if (hasTransformOrigin) {
            style.transformOrigin = buildTransformOrigin(transformOrigin)
        }
    }
}
