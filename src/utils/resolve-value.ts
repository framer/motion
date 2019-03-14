import {
    CustomValueType,
    ValueTarget,
    ResolvedValueTarget,
    ResolvedKeyframesTarget,
    SingleTarget,
} from "../types"
import { invariant } from "hey-listen"
import { isKeyframesTarget } from "../animation/utils/is-keyframes-target"

const isCustomValue = (v: any): v is CustomValueType => {
    return typeof v === "object" && v.mix && v.toValue
}

const resolveSingleValue = (v: string | number | CustomValueType) => {
    if (typeof v === "object") {
        invariant(
            isCustomValue(v),
            "Motion styles must be numbers, strings, or an instance with a `toValue` method."
        )

        return v.toValue()
    } else {
        return v
    }
}

export const resolveValue = (v: ValueTarget): ResolvedValueTarget => {
    return Array.isArray(v)
        ? ((v as []).map(resolveSingleValue) as ResolvedKeyframesTarget)
        : resolveSingleValue(v)
}

export const resolveFinalValueInKeyframes = (v: ValueTarget): SingleTarget => {
    // TODO maybe throw if v.length - 1 is placeholder token?
    return isKeyframesTarget(v) ? v[v.length - 1] || 0 : v
}
