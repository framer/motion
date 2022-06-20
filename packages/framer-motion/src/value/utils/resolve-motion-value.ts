import { MotionValue } from ".."
import { isCustomValue } from "../../utils/resolve-value"
import { CustomValueType } from "../../types"
import { isMotionValue } from "./is-motion-value"

/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * TODO: Remove and move to library
 */
export function resolveMotionValue(
    value?: string | number | CustomValueType | MotionValue
): string | number {
    const unwrappedValue = isMotionValue(value) ? value.get() : value
    return isCustomValue(unwrappedValue)
        ? unwrappedValue.toValue()
        : unwrappedValue
}
