import { ResolvedValues } from "../../types"
import { DOMVisualElementConfig, TransformOrigin } from "../types"
import { getDefaultValueType, getValueAsType } from "./value-types"
import { isTransformProp, isTransformOriginProp } from "./transform"
import { buildTransform } from "./build-transform"
import { isCSSVariable } from "./is-css-variable"
import { valueScaleCorrection } from "../layout/scale-correction"
import { Point2D, AxisBox2D } from "../../../types/geometry"
import { BoxDelta } from "../../../motion/features/auto/types"

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
    isLayoutAware: boolean = false,
    layoutDelta?: BoxDelta,
    transformDelta?: BoxDelta,
    treeScale?: Point2D,
    viewportBox?: AxisBox2D
): void {
    // Only perform scale correction if we've been provided data to perform
    // the calculations and if all scales don't equal 1
    const performScaleCorrection =
        isLayoutAware && shouldPerformScaleCorrection(layoutDelta, treeScale)

    // Empty the transformKeys array. As we're throwing out refs to its items
    // this might not be as cheap as suspected. Maybe using the array as a buffer
    // with a manual incrementation would be better.
    transformKeys.length = 0

    // Track whether we encounter any transform or transformOrigin values.
    let hasTransform = isLayoutAware
    let hasTransformOrigin = isLayoutAware

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
            if (performScaleCorrection && valueScaleCorrection[key]) {
                const corrected = valueScaleCorrection[key].process(
                    value,
                    layoutDelta,
                    treeScale,
                    viewportBox
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

    // Only process transform if values aren't defaults
    if (hasTransform || transformTemplate) {
        if (!isLayoutAware) {
            style.transform = buildTransform(
                transform,
                transformKeys,
                transformTemplate,
                transformIsNone,
                enableHardwareAcceleration,
                allowTransformNone
            )
        } else {
            style.transform = `translateX(${transformDelta.x.translate /
                treeScale.x}px) translateY(${transformDelta.y.translate /
                treeScale.y}px) scaleX(${transformDelta.x.scale}) scaleY(${
                transformDelta.y.scale
            }) translateZ(0)`
        }
    }

    // Only process transform origin if values aren't default
    if (hasTransformOrigin) {
        const originX =
            isLayoutAware && transformDelta
                ? transformDelta.x.origin * 100 + "%"
                : transformOrigin.originX || "50%"

        const originY =
            isLayoutAware && transformDelta
                ? transformDelta.y.origin * 100 + "%"
                : transformOrigin.originY || "50%"
        const originZ = transformOrigin.originZ || "0"
        style.transformOrigin = `${originX} ${originY} ${originZ}`
    }

    // // console.log(this.element.id, getFrameData().timestamp)

    // // TODO move this into transform reconciler
    // // TODO Figure out if we want to share translate X and Y
    // this.config.transformTemplate = (_, gen) => {
    //     return `${gen} translateX(${this.transformDelta.x.translate /
    //         this.treeScale.x}px) translateY(${this.transformDelta.y.translate /
    //         this.treeScale.y}px) scaleX(${this.transformDelta.x.scale}) scaleY(${
    //         this.transformDelta.y.scale
    //     })`
    // }

    // /// TODO: Make these motion values always
    // this.latest.originX = this.transformDelta.x.origin
    // this.latest.originY = this.transformDelta.y.origin
}

function shouldPerformScaleCorrection(
    transformDelta?: BoxDelta,
    treeScale?: Point2D
) {
    return (
        transformDelta &&
        treeScale &&
        (transformDelta.x.scale !== 1 ||
            transformDelta.y.scale !== 1 ||
            treeScale.x !== 1 ||
            treeScale.y !== 1)
    )
}
