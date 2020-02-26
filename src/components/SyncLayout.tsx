import * as React from "react"
import { createContext } from "react"
import { syncTree, flushTree } from "../utils/tree-sync"
import { Snapshot } from "../motion/auto/types"

export interface SyncLayoutUtils {
    syncTree: typeof syncTree
    forceRender: () => void
    register: (child: SyncLayoutChild) => () => void
}

export interface SyncLayoutChild {
    id?: string
    snapshot: () => Snapshot
    resume?: (prev: Snapshot) => void
}

interface Props {
    children: React.ReactNode
}

const continuity = new Map<string, Snapshot>()

export const SyncLayoutContext = createContext<SyncLayoutUtils | null>(null)

/**
 * TODO: Update the documentation for this component
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
export class SyncLayout extends React.Component<Props, SyncLayoutUtils> {
    children = new Set<SyncLayoutChild>()
    queue = new Set<string>()

    state: SyncLayoutUtils = {
        register: child => this.register(child),
        forceRender: () => this.forceRender(),
        syncTree: (id, callback) => {
            this.queue.add(id)
            syncTree(id, callback)
        },
    }

    register(child: SyncLayoutChild) {
        this.children.add(child)

        if (child.resume) {
            const id = child.id as string
            const prev = continuity.get(id)

            if (prev) {
                child.resume(prev)
                continuity.delete(id)
            }
        }

        return () => this.children.delete(child)
    }

    getSnapshotBeforeUpdate() {
        this.children.forEach(snapshotChild)
        return null
    }

    componentDidMount() {
        this.flush()
    }

    componentDidUpdate() {
        this.flush()
    }

    flush() {
        this.queue.forEach(flushTree)
    }

    forceRender() {
        this.setState({ ...this.state })
    }

    forceUpdate() {
        this.setState(this.state)
    }

    render() {
        const { children } = this.props

        return (
            <SyncLayoutContext.Provider value={this.state}>
                {children}
            </SyncLayoutContext.Provider>
        )
    }
}

function snapshotChild({ id, snapshot }: SyncLayoutChild) {
    const prev = snapshot()
    if (id !== undefined) continuity.set(id, prev)
}
