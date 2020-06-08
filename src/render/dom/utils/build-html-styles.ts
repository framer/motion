import { ResolvedValues } from "../../types"
import { HTMLVisualElementConfig, TransformOrigin } from "../types"
import { getValueType, getValueAsType } from "./value-types"
import { isTransformProp, isTransformOriginProp } from "./transform"
import { buildTransform } from "./build-transform"

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
 * This function is mutative.
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
    }: HTMLVisualElementConfig
): void {
    transformKeys.length = 0
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
            const valueKey = key // useDashCase ? camelToDash(key) : key

            if (key.startsWith("--")) {
                vars[valueKey] = valueAsType
            } else {
                style[valueKey] = valueAsType
            }
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
        const originZ = transformOrigin.originZ || "0"
        style.transformOrigin = `${originX} ${originY} ${originZ}`
    }
}
