import { rootProjectionNode } from "./node/HTMLProjectionNode"

export function useInstantLayoutTransition(): (
    cb?: (() => void) | undefined
) => void {
    return startTransition
}

function startTransition(cb?: () => void) {
    if (!rootProjectionNode.current) return
    rootProjectionNode.current.isUpdating = false
    rootProjectionNode.current.blockUpdate()
    cb?.()
}
