import { rootProjectionNode } from "./node/HTMLProjectionNode"

export function useInstantLayoutTransition(): (
    cb?: (() => void) | undefined
) => void {
    console.log("render")
    return startTransition
}

function startTransition(cb?: () => void) {
    console.log("starting transition, blocking update")
    if (!rootProjectionNode.current) return
    rootProjectionNode.current.isUpdating = false
    rootProjectionNode.current.blockUpdate()
    cb?.()
}
