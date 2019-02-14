import { useMemo } from "react"
import { motionValue, MotionValue } from "."

/**
 * Create a `MotionValue`.
 *
 * @param initial - The initial state of the `MotionValue`
 * @returns `MotionValue`
 *
 * @public
 */
export function useMotionValue<T>(initial: T): MotionValue<T> {
    return useMemo(() => motionValue(initial), [])
}
