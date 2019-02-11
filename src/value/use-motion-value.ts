import { useMemo } from "react"
import { motionValue, MotionValue } from "."

/**
 * An animatable value for advanced use-cases
 *
 * @param {number | string} init - The initial state of the `MotionValue`
 * @returns `MotionValue`
 *
 * @public
 */
export const useMotionValue = <T>(init: T): MotionValue<T> => {
    return useMemo(() => motionValue(init), [])
}
