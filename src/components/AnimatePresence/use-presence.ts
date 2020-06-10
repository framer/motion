import { useContext, useEffect } from "react"
import { PresenceContext } from "./PresenceContext"

export type SafeToRemove = () => void

type AlwaysPresent = [true, null]

type Present = [true]

type NotPresent = [false, SafeToRemove]

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
export function usePresence(): AlwaysPresent | Present | NotPresent {
    const context = useContext(PresenceContext)
    if (context === null) return [true, null]

    const { isPresent, onExitComplete, register } = context

    // Context will never change without full re-renders so it's safe to call this hook conditionally
    useEffect(register, [])

    return !isPresent && onExitComplete ? [false, onExitComplete] : [true]
}

export function useIsPresent() {
    const context = useContext(PresenceContext)
    return context === null ? true : context.isPresent
}
