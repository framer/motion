import * as React from "react"
import { createContext, useMemo, useState } from "react"

interface SharedLayout {
    syncLayout?: () => void
}

interface SharedLayoutProps {
    children: React.ReactChild
}

export const SharedLayoutContext = createContext<SharedLayout>({})

/**
 * TODODODODODOD
 *
 * @public
 */
export const SharedLayout = ({ children }: SharedLayoutProps) => {
    const [forcedRenderCount, setRenderCount] = useState(0)

    const contextValue = useMemo(
        () => ({
            syncLayout: () => setRenderCount(forcedRenderCount + 1),
        }),
        [forcedRenderCount]
    )

    return (
        <SharedLayoutContext.Provider value={contextValue}>
            {children}
        </SharedLayoutContext.Provider>
    )
}
