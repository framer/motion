import { useMemo } from "react"
import { motionValue, MotionValue } from "."

/**
 * Creates a `MotionValue` to track the state and velocity of a value.
 *
 * Usually, these are created automatically. For advanced use-cases, like use with `useTransformedValue`, you can create `MotionValue`s externally and pass them into the animated component via the `style` prop.
 *
 * ```jsx
 * export function MyComponent() {
 *   const scale = useMotionValue(1)
 *
 *   return <Frame style={{ scale: scale }} />
 * }
 * ```
 *
 * @param initial - The initial state.
 *
 * @public
 */
export function useMotionValue<T>(initial: T): MotionValue<T> {
    return useMemo(() => motionValue(initial), [])
}
