import * as React from "react"
import { createContext, useMemo, useEffect, useLayoutEffect } from "react"
import { useForceUpdate } from "../utils/use-force-update"
import { syncTree, flushTree } from "../utils/tree-sync"
import { useConstant } from "../utils/use-constant"

export interface SyncLayoutUtils {
    syncTree: typeof syncTree
    forceRerender: () => void
}

interface Props {
    children: React.ReactNode
}

/**
 * In server environments, running useLayoutEffect throws a React warning. `SyncLayout` is
 * used for syncing *changes* in layout - running synchronously to remove visual flickering. It
 * isn't used in any instances where this will deviate from the server's rendered state,
 * making this hack safe.
 * Taken from https://github.com/alloc/react-layout-effect
 */
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
        ? useLayoutEffect
        : useEffect

export const SyncLayoutContext = createContext<SyncLayoutUtils | null>(null)

/**
 * When layout changes happen asynchronously to their instigating render (ie when exiting
 * children of `AnimatePresence` are removed), `SyncLayout` can wrap parent and sibling
 * components that need to animate as a result of this layout change.
 *
 * @motion
 *
 * ```jsx
 * const MyComponent = ({ isVisible }) => {
 *   return (
 *     <SyncLayout>
 *       <AnimatePresence>
 *         {isVisible && (
 *           <motion.div exit={{ opacity: 0 }} />
 *         )}
 *       </AnimatePresence>
 *       <motion.div positionTransition />
 *     </SyncLayout>
 *   )
 * }
 * ```
 *
 * @internalremarks
 *
 * The way this component works is by memoising a function and passing it down via context.
 * The function, when called, updates the local state, which is used to invalidate the
 * memoisation cache. A new function is called, performing a synced re-render of components
 * that are using the SyncLayoutContext.
 *
 * @internal
 */
export const SyncLayout = ({ children }: Props) => {
    const toFlush = useConstant(createSet)
    const forceUpdate = useForceUpdate()
    const forceRerender = useForceUpdate()

    const context = useMemo((): SyncLayoutUtils => {
        return {
            syncTree: (id, callback) => {
                const alreadyScheduled = toFlush.has(id)
                toFlush.add(id)
                syncTree(id, callback)
                !alreadyScheduled && forceUpdate()
            },
            forceRerender,
        }
    }, [forceRerender])

    useIsomorphicLayoutEffect(() => {
        toFlush.forEach(flushTree)
    })

    return (
        <SyncLayoutContext.Provider value={context}>
            {children}
        </SyncLayoutContext.Provider>
    )
}

function createSet() {
    return new Set<string>()
}
