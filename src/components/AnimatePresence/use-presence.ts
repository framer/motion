import { useContext, useEffect } from "react"
import { PresenceContext } from "./PresenceContext"
import { warning } from "hey-listen"

type Present = [true]

type NotPresent = [false, () => void]

/**
 * When a component is the child of `AnimatePresence`, it can use `usePresence`
 * to access information about whether it's still present in the React tree.
 *
 * ```jsx
 * import { usePresence } from "framer-motion"
 *
 * export const Component = () => {
 *   const [isPresent, safeToRemove] = usePresence()
 *
 *   useEffect(() => {
 *     !isPresent setTimeout(safeToRemove, 1000)
 *   }, [isPresent])
 *
 *   return <div />
 * }
 * ```
 *
 * If `isPresent` is `false`, it means that a component has been removed the tree, but
 * `AnimatePresence` won't really remove it until `safeToRemove` has been called.
 *
 * @public
 */
export function usePresence(): Present | NotPresent {
    const context = useContext(PresenceContext)

    warning(
        context !== null,
        "Component attempting to use presence outside of a AnimatePresence component. It will be removed from the tree without transition."
    )
    if (context === null) return [true]
    const { isPresent, onExitComplete, register } = context

    useEffect(register, [])

    return !isPresent && onExitComplete ? [false, onExitComplete] : [true]
}
