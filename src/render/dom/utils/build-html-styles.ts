import { ResolvedValues } from "../../VisualElement/types"
import { DOMVisualElementConfig, TransformOrigin } from "../types"
import { getDefaultValueType, getValueAsType } from "./value-types"
import { isTransformProp, isTransformOriginProp } from "./transform"
import {
    buildTransform,
    buildLayoutProjectionTransform,
    buildLayoutProjectionTransformOrigin,
    buildTransformOrigin,
} from "./build-transform"
import { isCSSVariable } from "./is-css-variable"
import { valueScaleCorrection } from "../layout/scale-correction"
import { Point2D, AxisBox2D, BoxDelta } from "../../../types/geometry"

/**
 * Build style and CSS variables
 *
 * This function converts a Motion style prop:
 *
 * { x: 100, width: 100, originX: 0.5 }
 *
 * Into an object with default value types applied and default
 * transform order set:
 *
 * {
 *   transform: 'translateX(100px) translateZ(0)`,
 *   width: '100px',
 *   transformOrigin: '50% 50%'
 * }
 *
 * Styles are saved to `style` and CSS vars to `vars`.
 *
 * This function works with mutative data structures.
 */
export function buildHTMLStyles(
    latest: ResolvedValues,
    style: ResolvedValues,
    vars: ResolvedValues,
    transform: ResolvedValues,
    transformOrigin: TransformOrigin,
    transformKeys: string[],
    {
        enableHardwareAcceleration,
        transformTemplate,
        allowTransformNone,
    }: DOMVisualElementConfig,
    isLayoutProjectionEnabled?: boolean,
    delta?: BoxDelta,
    deltaFinal?: BoxDelta,
    treeScale?: Point2D,
    targetBox?: AxisBox2D
): void {
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
     * as a style or CSS variable. Transforms and transform origins are kept seperately
     * for further processing
     */
    for (const key in latest) {
        const value = latest[key]

        // Convert the value to its default value type, ie 0 -> "0px"
        const valueType = getDefaultValueType(key)
        const valueAsType = getValueAsType(value, valueType)

        if (isTransformProp(key)) {
            // If this is a transform, flag and enable further transform processing
            hasTransform = true
            transform[key] = valueAsType
            transformKeys.push(key)

            if (!transformIsNone) continue

            // If all the transform keys we've so far encountered are their default value
            // then check to see if this one isn't
            const defaultValue =
                valueType.default !== undefined ? valueType.default : 0

            if (value !== defaultValue) transformIsNone = false
        } else if (isTransformOriginProp(key)) {
            // If this is a transform origin, flag and enable further transform-origin processing
            transformOrigin[key] = valueAsType
            hasTransformOrigin = true
        } else if (key !== "transform" || typeof value !== "function") {
            // Handle all remaining values. Decide which map to save to depending
            // on whether this is a CSS variable
            const bucket = isCSSVariable(key) ? vars : style

            // If we need to perform scale correction, and we have a handler for this
            // value type (ie borderRadius), perform it

            if (isLayoutProjectionEnabled && valueScaleCorrection[key]) {
                const corrected = valueScaleCorrection[key].process(
                    value,
                    targetBox!,
                    delta!,
                    treeScale!
                )
                /**
                 * Scale-correctable values can define a number of other values to break
                 * down into. For instance borderRadius needs applying to borderBottomLeftRadius etc
                 */
                const { applyTo } = valueScaleCorrection[key]
                if (applyTo) {
                    const num = applyTo.length
                    for (let i = 0; i < num; i++) {
                        bucket[applyTo[i]] = corrected
                    }
                } else {
                    bucket[key] = corrected
                }
            } else {
                bucket[key] = valueAsType
            }
        }
    }

    /**
     * Build transform and transformOrigin. If we're performing layout projection these need
     * to be based off the deltaFinal data. Any user-set origins will have been pre-baked
     * into the deltaFinal.
     */
    if (isLayoutProjectionEnabled) {
        style.transform = buildLayoutProjectionTransform(
            deltaFinal!,
            treeScale!,
            hasTransform ? transform : undefined
        )

        if (transformTemplate) {
            style.transform = transformTemplate(transform, style.transform)
        }

        style.transformOrigin = buildLayoutProjectionTransformOrigin(
            deltaFinal!
        )
    } else {
        if (hasTransform) {
            style.transform = buildTransform(
                transform,
                transformKeys,
                transformTemplate,
                transformIsNone,
                enableHardwareAcceleration,
                allowTransformNone
            )
        }

        if (hasTransformOrigin) {
            style.transformOrigin = buildTransformOrigin(transformOrigin)
        }
    }
}
