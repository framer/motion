import { useContext } from "react"
import { MotionContext } from "../../motion/context/MotionContext"

type Present = [true]

type NotPresent = [false, () => void]

/**
 * When a component is the child of an `AnimatePresence` component, it has access to
 * information about whether it's still present the React tree. `usePresence` can be
 * used to access that data and perform operations before the component can be considered
 * safe to remove.
 *
 * When `isPresent` is `true`, the `safeToRemove` callback is `undefined`.
 *
 * ```jsx
 * const [isPresent, safeToRemove] = usePresence()
 *
 * useEffect(() => {
 *   !isPresent setTimeout(safeToRemove, 1000)
 * }, [isPresent])
 * ```
 *
 * @public
 */
export function usePresence(): Present | NotPresent {
    const { exitProps } = useContext(MotionContext)

    if (!exitProps) return [true]

    const { isExiting, onExitComplete } = exitProps
    return isExiting && onExitComplete ? [false, onExitComplete] : [true]
}
