import { DOMKeyframesDefinition } from "../types"

export function isDOMKeyframes(
    keyframes: unknown
): keyframes is DOMKeyframesDefinition {
    return typeof keyframes === "object" && !Array.isArray(keyframes)
}
