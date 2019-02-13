import { useMemo } from "react"
import { motionValue, MotionValue } from "."

/**
 * Create a `MotionValue`
 *
 * @param {number | string} init - The initial state of the `MotionValue`
 * @returns `MotionValue`
 *
 * @public
 */
export function useMotionValue<T>(init: T): MotionValue<T> {
    return useMemo(() => motionValue(init), [])
}
