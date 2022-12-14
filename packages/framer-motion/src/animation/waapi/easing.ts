import { BezierDefinition, EasingDefinition } from "../../easing/types"
import { camelToDash } from "../../render/dom/utils/camel-to-dash"

export const cubicBezierAsString = ([a, b, c, d]: BezierDefinition) =>
    `cubic-bezier(${a}, ${b}, ${c}, ${d})`

const validWaapiEasing = new Set([
    "linear",
    "ease-in",
    "ease-out",
    "ease-in-out",
])

export function mapEasingName(easingName: string): string {
    const name = camelToDash(easingName)
    return validWaapiEasing.has(name) ? name : "ease"
}

export function mapEasingToNativeEasing(
    easing?: EasingDefinition
): string | undefined {
    if (!easing) return undefined
    return Array.isArray(easing)
        ? cubicBezierAsString(easing)
        : mapEasingName(easing)
}
