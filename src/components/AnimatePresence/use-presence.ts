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
 * It returns two values. `isPresent` is a boolean that is `true` when the component
 * is present within the React tree. It is `false` when it's been removed, but still visible.
 *
 * When `isPresent` is `false`, the `safeToRemove` callback can be used to tell `AnimatePresence`
 * that it's safe to remove the component from the DOM, for instance after a animation has completed.
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
