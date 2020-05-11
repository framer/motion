import { TransformTemplate } from "../../../motion/types"
import { ResolvedValues } from "./types"
import { getValueType, getValueAsType } from "./utils/value-types"
import { isTransformProp, isTransformOriginProp } from "./utils/transform"
import { camelToDash } from "./utils/camel-to-dash"
import { buildTransform } from "./transform"

export interface BuildStylePropConfig {
    enableHardwareAcceleration?: boolean
    transformTemplate?: TransformTemplate
    allowTransformNone?: boolean
    useDashCase?: boolean

    /**
     * These structures are optionally provided externally to allow
     * for data structure re-use
     */
    style?: ResolvedValues
    transform?: ResolvedValues
    transformOrigin?: ResolvedValues
    transformKeys?: string[]
}

/**
 * Build style property
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
 * So we can apply these to React's style prop or the DOM's style prop.
 */
export function buildStyleProp(
    latest: ResolvedValues,
    {
        enableHardwareAcceleration = true,
        transformTemplate,
        allowTransformNone,
        useDashCase = false,
        style = {},
        transform = {},
        transformOrigin = {},
        transformKeys = [],
    }: BuildStylePropConfig
) {
    let transformIsDefault = true
    let hasTransform = false
    let hasTransformOrigin = false

    for (const key in latest) {
        const value = latest[key]
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
        } else if (key !== "transform" || typeof value !== "function") {
            const valueKey = useDashCase ? camelToDash(key) : key
            style[valueKey] = valueAsType
        }
    }

    // Only process and set transform prop if values aren't defaults
    if (hasTransform || transformTemplate) {
        style.transform = buildTransform(
            transform,
            transformKeys,
            transformTemplate,
            transformIsDefault,
            enableHardwareAcceleration,
            allowTransformNone
        )
    }

    if (hasTransformOrigin) {
        const originX = transformOrigin.originX || "50%"
        const originY = transformOrigin.originY || "50%"
        const originZ = transformOrigin.originZ || "50%"
        style.transformOrigin = `${originX} ${originY} ${originZ}`
    }

    return style
}
