import { useMemo } from "react"
import { motionValue, MotionValue } from "."

/**
 * Returns a `MotionValue` for use in advanced cases like `useTransformedValue()`
 *
 * @param initial - The initial state.
 *
 * @public
 */
export function useMotionValue<T>(initial: T): MotionValue<T> {
    return useMemo(() => motionValue(initial), [])
}
