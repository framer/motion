import { MotionValue } from "../"

/**
 * @internal
 */
export function unwrapMotionValue<V>(value: V | MotionValue<V>): V {
    if (value instanceof MotionValue) {
        return value.get()
    }
    return value
}
