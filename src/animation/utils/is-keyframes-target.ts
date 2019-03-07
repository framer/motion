import { ValueTarget, KeyframesTarget, SingleTarget } from "../../types"

export const isKeyframesTarget = (v: ValueTarget): v is KeyframesTarget => {
    return Array.isArray(v)
}

export const resolveSingleTargetFromKeyframes = (
    v: ValueTarget
): SingleTarget => {
    // TODO maybe throw if v.length - 1 is placeholder token?
    return isKeyframesTarget(v) ? v[v.length - 1] || 0 : v
}
