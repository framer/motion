import { ValueType } from "style-value-types"

/**
 * ValueType for "auto"
 */
export const auto: ValueType = {
    test: (v: any) => v === "auto",
    parse: (v) => v,
}
