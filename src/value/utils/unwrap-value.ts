import { MotionValue } from "../"

/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * @internal
 */
export function unwrapMotionValue<V>(value: V | MotionValue<V>): V {
    if (value instanceof MotionValue) {
        return value.get()
    }
    return value
}
