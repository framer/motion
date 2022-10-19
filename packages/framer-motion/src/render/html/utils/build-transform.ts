import { transformPropOrder } from "./transform"
import { DOMVisualElementOptions } from "../../dom/types"
import { MotionProps } from "../../../motion/types"
import { HTMLRenderState } from "../types"

const translateAlias = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
}

/**
 * A function to use with Array.sort to sort transform keys by their default order.
 */
const sortTransformProps = (a: string, b: string) =>
    transformPropOrder.indexOf(a) - transformPropOrder.indexOf(b)

/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export function buildTransform(
    {
        transform,
        transformKeys,
    }: Pick<HTMLRenderState, "transform" | "transformKeys">,
    {
        enableHardwareAcceleration = true,
        allowTransformNone = true,
    }: DOMVisualElementOptions,
    transformIsDefault: boolean,
    transformTemplate?: MotionProps["transformTemplate"]
) {
    // The transform string we're going to build into.
    let transformString = ""

    // Transform keys into their default order - this will determine the output order.
    transformKeys.sort(sortTransformProps)

    // Loop over each transform and build them into transformString
    for (const key of transformKeys) {
        transformString += `${translateAlias[key] || key}(${transform[key]}) `
    }

    if (enableHardwareAcceleration && !transform.z) {
        transformString += "translateZ(0)"
    }

    transformString = transformString.trim()

    // If we have a custom `transform` template, pass our transform values and
    // generated transformString to that before returning
    if (transformTemplate) {
        transformString = transformTemplate(
            transform,
            transformIsDefault ? "" : transformString
        )
    } else if (allowTransformNone && transformIsDefault) {
        transformString = "none"
    }

    return transformString
}
