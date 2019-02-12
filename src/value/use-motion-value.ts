import { useMemo } from "react"
import { motionValue, MotionValue } from "."

/**
 * For advanced use-cases, you can assume external control of the motion values used by `motion` components.
 *
 * This is usually used in conjunction with `useTransform`.
 *
 * ## Import
 *
 * ```javascript
 * import { useMotionValue } from 'framer-motion'
 * ```
 *
 * ## Usage
 *
 * Motion values are created with the `useMotionValue` hook, providing it an initial value:
 *
 * ```javascript
 * const x = useMotionValue(0)
 * ```
 *
 * This can be passed to a motion component via the `motionValue` prop:
 *
 * ```javascript
 * const MotionComponent = motion.div()
 *
 * export const () => {
 *   const x = useMotionValue(0)
 *
 *   return <MotionComponent motionValues={{ x }} />
 * }
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
