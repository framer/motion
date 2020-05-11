import { ResolvedValues } from "./types"
import { sortTransformProps } from "./utils/transform"
import { TransformTemplate } from "../../../motion/types"

const translateAlias: { [key: string]: string } = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
}

export function buildTransform(
    transform: ResolvedValues,
    transformKeys: string[],
    transformTemplate: TransformTemplate | undefined,
    transformIsDefault: boolean,
    enableHardwareAcceleration: boolean,
    allowTransformNone = true
) {
    let transformString = ""
    let transformHasZ = false
    transformKeys.sort(sortTransformProps)

    const numTransformKeys = transformKeys.length

    for (let i = 0; i < numTransformKeys; i++) {
        const key = transformKeys[i]
        transformString += `${translateAlias[key] || key}(${transform[key]}) `
        transformHasZ = key === "z" ? true : transformHasZ
    }

    if (!transformHasZ && enableHardwareAcceleration) {
        transformString += "translateZ(0)"
    } else {
        transformString = transformString.trim()
    }

    // If we have a custom `transform` template
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
