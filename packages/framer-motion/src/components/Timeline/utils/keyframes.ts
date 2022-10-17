import { UnresolvedKeyframeValue } from "../types"

export function asKeyframesList(
    keyframes: UnresolvedKeyframeValue | UnresolvedKeyframeValue[]
): UnresolvedKeyframeValue[] {
    return Array.isArray(keyframes) ? keyframes : [keyframes]
}
