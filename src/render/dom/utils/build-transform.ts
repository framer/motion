import { TransformTemplate } from "../../../motion/types"
import { ResolvedValues } from "../../types"
import { sortTransformProps } from "./transform"

const translateAlias: { [key: string]: string } = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
}

/**
 * Build a CSS transform style from individual x/y/scale etc properties.
 *
 * This outputs with a default order of transforms/scales/rotations, this can be customised by
 * providing a transformTemplate function.
 */
export function buildTransform(
    transform: ResolvedValues,
    transformKeys: string[],
    transformTemplate: TransformTemplate | undefined,
    transformIsDefault: boolean,
    enableHardwareAcceleration = true,
    allowTransformNone = true
) {
    // The transform string we're going to build into
    let transformString = ""

    // Track whether the defined transform has a defined z so we don't add a
    // second to enable hardware acceleration
    let transformHasZ = false

    // Transform keys into their default order - this will determine the output order.
    transformKeys.sort(sortTransformProps)

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
