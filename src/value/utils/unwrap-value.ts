import { MotionValue } from "../"
import { resolveSingleValue } from "../../utils/resolve-value"
import { CustomValueType } from "../../types"

/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * @internal
 */
export function unwrapMotionValue(
    value: string | number | CustomValueType | MotionValue<V>
): string | number {
    const unwrappedValue = value instanceof MotionValue ? value.get() : value
    return resolveSingleValue(unwrappedValue)
}
