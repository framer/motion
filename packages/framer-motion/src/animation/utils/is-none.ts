import { isZeroValueString } from "../../utils/is-zero-value-string"

export function isNone(value: string | number | null) {
    if (typeof value === "number") {
        return value === 0
    } else if (value !== null) {
        return value === "none" || value === "0" || isZeroValueString(value)
    }
}
