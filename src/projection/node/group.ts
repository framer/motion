import { IProjectionNode } from "./create-projection-node"

const notify = (node: IProjectionNode) =>
    !node.isLayoutDirty && node.willUpdate(false)

export function nodeGroup() {
    const nodes = new Set<IProjectionNode>()
    const subscriptions = new WeakMap<IProjectionNode, () => void>()

    const dirtyAll = () => nodes.forEach(notify)

    return {
        add: (node: IProjectionNode) => {
            nodes.add(node)
            subscriptions.set(node, node.onLayoutWillUpdate(dirtyAll))
        },
        remove: (node: IProjectionNode) => {
            nodes.delete(node)
            subscriptions.get(node)?.()
            subscriptions.delete(node)
        },
    }
}
