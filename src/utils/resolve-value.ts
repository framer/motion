import { CustomValueType } from "../types"
import { invariant } from "hey-listen"

const isCustomValue = (v: any): v is CustomValueType => {
    return typeof v === "object" && v.mix && v.toValue
}

export const resolveValue = (v: string | number | CustomValueType) => {
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
