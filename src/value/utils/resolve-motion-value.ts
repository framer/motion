import { MotionValue } from ".."
import { isCustomValue } from "../../utils/resolve-value"
import { CustomValueType } from "../../types"

/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * TODO: Remove and move to library
 *
 * @internal
 */
export function resolveMotionValue(
    value?: string | number | CustomValueType | MotionValue
): string | number {
    const unwrappedValue = value instanceof MotionValue ? value.get() : value
    return isCustomValue(unwrappedValue)
        ? unwrappedValue.toValue()
        : unwrappedValue
}
