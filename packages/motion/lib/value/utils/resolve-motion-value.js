import { isCustomValue } from "../../utils/resolve-value";
import { isMotionValue } from "./is-motion-value";
/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * TODO: Remove and move to library
 *
 * @internal
 */
export function resolveMotionValue(value) {
    var unwrappedValue = isMotionValue(value) ? value.get() : value;
    return isCustomValue(unwrappedValue)
        ? unwrappedValue.toValue()
        : unwrappedValue;
}
//# sourceMappingURL=resolve-motion-value.js.map