import { useMemo } from "react"
import { motionValue, MotionValue } from "."

/**
 * Create a motion value externally from a motion component for advanced use-cases.
 *
 * @remarks
 * Usually, a `motion` component is responsible for creating its own `MotionValue`s for maintaining animation state.
 *
 * `useMotionValue` can create `MotionValue`s externally, to be used with `useTransformedValue`.
 *
 * `MotionValue`s should be passed into `motion` components via the `style` prop:
 *
 * ```jsx
 * const x = useMotionValue(0)
 *
 * return <motion.div style={{ x }} />
 * ```
 *
 * @param {number | string} init - The initial state of the `MotionValue`
 * @returns `MotionValue`
 *
 * @public
 */
export const useMotionValue = <T>(init: T): MotionValue<T> => {
    return useMemo(() => motionValue(init), [])
}
