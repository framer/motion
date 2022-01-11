import { sortTransformProps } from "./transform"
import { DOMVisualElementOptions } from "../../dom/types"
import { MotionProps } from "../../../motion/types"
import { HTMLRenderState, TransformOrigin } from "../types"

const translateAlias: { [key: string]: string } = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
    transformPerspective: "perspective",
}

/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export function buildTransform(
    { transform, transformKeys }: HTMLRenderState,
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

    // Track whether the defined transform has a defined z so we don't add a
    // second to enable hardware acceleration
    let transformHasZ = false

    // Loop over each transform and build them into transformString
    const numTransformKeys = transformKeys.length
    for (let i = 0; i < numTransformKeys; i++) {
        const key = transformKeys[i]
        transformString += `${translateAlias[key] || key}(${transform[key]}) `

        if (key === "z") transformHasZ = true
    }

    if (!transformHasZ && enableHardwareAcceleration) {
        transformString += "translateZ(0)"
    } else {
        transformString = transformString.trim()
    }

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

/**
 * Build a transformOrigin style. Uses the same defaults as the browser for
 * undefined origins.
 */
export function buildTransformOrigin({
    originX = "50%",
    originY = "50%",
    originZ = 0,
}: TransformOrigin) {
    return `${originX} ${originY} ${originZ}`
}
