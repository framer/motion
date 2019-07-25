import * as React from "react"
import { createContext, useCallback, useState } from "react"

type SyncLayout = () => void

interface SharedLayoutProps {
    children: React.ReactNode
}

export const SharedLayoutContext = createContext<SyncLayout | null>(null)

/**
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
