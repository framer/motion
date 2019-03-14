import { ValueTarget, KeyframesTarget, SingleTarget } from "../../types"
import { resolveValue } from "../../utils/resolve-value"

export const isKeyframesTarget = (v: ValueTarget): v is KeyframesTarget => {
    return Array.isArray(v)
}

export const resolveSingleTargetFromKeyframes = (
    v: ValueTarget
): SingleTarget => {
    // TODO maybe throw if v.length - 1 is placeholder token?
    const singleValue = isKeyframesTarget(v) ? v[v.length - 1] || 0 : v

    return resolveValue(singleValue)
}
