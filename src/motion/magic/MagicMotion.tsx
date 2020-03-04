import * as React from "react"
import { createContext } from "react"
import { syncTree, flushTree } from "../../utils/tree-sync"
import { Snapshot } from "./types"

export interface MagicMotionUtils {
    syncTree: typeof syncTree
    forceRender: () => void
    register: (child: MagicMotionChild) => () => void
}

export interface MagicMotionChild {
    id?: string
    snapshot: () => Snapshot
    resetRotation: () => void
    resume?: (prev?: Snapshot) => void
}

interface Props {
    children: React.ReactNode
}

const continuity = new Map<string, Snapshot>()

export const MagicMotionContext = createContext<MagicMotionUtils | null>(null)

/**
 * TODO: Update the documentation for this component
 * When layout changes happen asynchronously to their instigating render (ie when exiting
 * children of `AnimatePresence` are removed), `MagicMotion` can wrap parent and sibling
 * components that need to animate as a result of this layout change.
 *
 * @motion
 *
 * ```jsx
 * const MyComponent = ({ isVisible }) => {
 *   return (
 *     <MagicMotion>
 *       <AnimatePresence>
 *         {isVisible && (
 *           <motion.div exit={{ opacity: 0 }} />
 *         )}
 *       </AnimatePresence>
 *       <motion.div positionTransition />
 *     </MagicMotion>
 *   )
 * }
 * ```
 *
 * @internalremarks
 *
 * The way this component works is by memoising a function and passing it down via context.
 * The function, when called, updates the local state, which is used to invalidate the
 * memoisation cache. A new function is called, performing a synced re-render of components
 * that are using the MagicMotionContext.
 *
 * @internal
 */
export class MagicMotion extends React.Component<Props, MagicMotionUtils> {
    children = new Set<MagicMotionChild>()

    // TODO: Revisit if we need this
    queue = new Set<string>()

    state: MagicMotionUtils = {
        register: child => this.register(child),
        forceRender: () => this.forceRender(),
        syncTree: (id, depth, callback) => {
            this.queue.add(id)
            return syncTree(id, depth, callback)
        },
    }

    register(child: MagicMotionChild) {
        this.children.add(child)

        if (child.resume) {
            // TODO: Only do this on subsequent renders
            const id = child.id as string
            const prev = continuity.get(id)
            child.resume(prev)
            continuity.delete(id)
        }

        return () => this.children.delete(child)
    }

    shouldComponentUpdate() {
        this.children.forEach(resetRotation)
        return true
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
        this.queue.clear()
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
            <MagicMotionContext.Provider value={this.state}>
                {children}
            </MagicMotionContext.Provider>
        )
    }
}

function snapshotChild({ id, snapshot }: MagicMotionChild) {
    const prev = snapshot()
    id !== undefined && continuity.set(id, prev)
}

function resetRotation({ resetRotation }: MagicMotionChild) {
    resetRotation()
}
