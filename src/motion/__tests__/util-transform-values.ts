import { invariant } from "hey-listen"
import { isCustomValue } from "../../utils/resolve-value"
import {
    CustomValueType,
    ValueTarget,
    ResolvedValueTarget,
    ResolvedKeyframesTarget,
} from "../../types"
import { ResolvedValues } from "../../render/types"

export const resolveSingleValue = (
    v: string | number | CustomValueType
): string | number => {
    if (v && typeof v === "object") {
        invariant(
            isCustomValue(v),
            "Motion styles must be numbers, strings, or an instance with a `toValue` and `mix` methods."
        )

        return v.toValue()
    } else {
        return v as string | number
    }
}

const resolveValue = (v: ValueTarget): ResolvedValueTarget => {
    return Array.isArray(v)
        ? ((v as []).map(resolveSingleValue) as ResolvedKeyframesTarget)
        : resolveSingleValue(v)
}

// If this function grows with new properties it'll probably benefit from a map approach
export const transformValues = <T extends ResolvedValues>(values: T): T => {
    for (const key in values) {
        values[key] = resolveValue(values[key]) as any
    }

    // Return early if we're not changing any values
    if (values.size === undefined && values.image === undefined) {
        return values
    }

    const { size, image, ...remainingValues } = values as any // Spread generics bug

    if (size !== undefined) {
        remainingValues.height = remainingValues.width = size
    }

    if (image !== undefined) {
        let backgroundImage = image
        if (!image.startsWith("url(")) {
            backgroundImage = `url(${image})`
        }
        remainingValues.backgroundImage = backgroundImage
        remainingValues.backgroundSize ??= "cover"
    }

    return remainingValues
}
