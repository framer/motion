import * as React from "react"
import { createContext, useCallback, useState } from "react"

type SyncLayout = () => void

interface SharedLayoutProps {
    children: React.ReactNode
}

export const SharedLayoutContext = createContext<SyncLayout | null>(null)

/**
 * When layout changes happen asynchronously to their instigating render (ie when exiting
 * children of `AnimatePresence` are removed), `SharedLayout` can wrap parent and sibling
 * components that need to animate as a result of this layout change.
 *
 * @motion
 *
 * ```jsx
 * const MyComponent = ({ isVisible }) => {
 *   return (
 *     <SharedLayout>
 *       <AnimatePresence>
 *         {isVisible && (
 *           <motion.div exit={{ opacity: 0 }} />
 *         )}
 *       </AnimatePresence>
 *       <motion.div positionTransition />
 *     </SharedLayout>
 *   )
 * }
 * ```
 *
 * @internalremarks
 *
 * The way this component works is by memoising a function and passing it down via context.
 * The function, when called, updates the local state, which is used to invalidate the
 * memoisation cache. A new function is called, performing a synced re-render of components
 * that are using the SharedLayoutContext.
 *
 * @beta
 */
export const SharedLayout = ({ children }: SharedLayoutProps) => {
    const [forcedRenderCount, setRenderCount] = useState(0)

    const contextValue = useCallback(
        () => setRenderCount(forcedRenderCount + 1),
        [forcedRenderCount]
    )

    return (
        <SharedLayoutContext.Provider value={contextValue}>
            {children}
        </SharedLayoutContext.Provider>
    )
}
