import { Styles, VisualElementOptions } from "../types"
import { getValueType, getValueAsType } from "../../value-types"
import {
    isTransformProp,
    isTransformOriginProp,
    sortTransformProps,
} from "./transform"
import { prefix } from "../html/prefix"
import { TransformTemplate } from "../../../motion/types"

const translateAlias = {
    x: "translateX",
    y: "translateY",
    z: "translateZ",
}

function buildTransform(
    transform: Styles,
    transformKeys: string[],
    transformIsDefault: boolean,
    enableHardwareAcceleration: boolean,
    transformTemplate?: TransformTemplate
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
        transformString = transformTemplate(transform, transformString)
    } else if (transformIsDefault) {
        transformString = "none"
    }

    return transformString
}

/**
 * Build style property
 *
 * This function converts a Stylefire-formatted CSS style
 * object, eg:
 *
 * { x: 100, width: 100 }
 *
 * Into an object with default value types applied and default
 * transform order set:
 *
 * { transform: 'translateX(100px) translateZ(0)`, width: '100px' }
 *
 * As this function can run multiple times per frame, it ideally
 * receives mutable data structures.
 */
export function buildStyles(
    targetStyles: Styles = {},
    newStyles: Styles = {},
    {
        enableHardwareAcceleration = true,
        isDashCase = false,
        transformTemplate,
    }: VisualElementOptions,
    transform: Styles = {},
    transformOrigin: Styles = {},
    transformKeys: string[] = []
): Styles {
    let transformIsDefault = true
    let hasTransform = false
    let hasTransformOrigin = false

    for (const key in newStyles) {
        const value = newStyles[key]
        const valueType = getValueType(key)
        const valueAsType = getValueAsType(value, valueType)

        if (isTransformProp(key)) {
            hasTransform = true
            transform[key] = valueAsType
            transformKeys.push(key)

            if (transformIsDefault) {
                if (
                    (valueType.default && value !== valueType.default) ||
                    (!valueType.default && value !== 0)
                ) {
                    transformIsDefault = false
                }
            }
        } else if (isTransformOriginProp(key)) {
            transformOrigin[key] = valueAsType
            hasTransformOrigin = true
        } else if (key !== "transform") {
            const prefixed = prefix(key, isDashCase)
            targetStyles[prefixed] = valueAsType
        }
    }

    // Only process and set transform prop if values aren't defaults
    if (hasTransform || !!transformTemplate) {
        targetStyles.transform = buildTransform(
            transform,
            transformKeys,
            transformIsDefault,
            enableHardwareAcceleration,
            transformTemplate
        )
    }

    if (hasTransformOrigin) {
        const originX = transformOrigin.originX || "50%"
        const originY = transformOrigin.originY || "50%"
        const originZ = transformOrigin.originZ || 0
        targetStyles.transformOrigin = `${originX} ${originY} ${originZ}`
    }

    return targetStyles
}

export const createBuildStyles = () => {
    const styles: Styles = {}
    const transform: Styles = {}
    const transformOrigin: Styles = {}
    const transformKeys: string[] = []

    return (newStyles: Styles, opts: VisualElementOptions = {}) => {
        transformKeys.length = 0

        buildStyles(
            styles,
            newStyles,
            opts,
            transform,
            transformOrigin,
            transformKeys
        )

        return styles
    }
}
