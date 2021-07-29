import * as React from "react"
import { rootProjectionNode } from "./node/HTMLProjectionNode"

export function useInstantLayoutTransition() {
    const startTransition = React.useCallback((cb?: () => void) => {
        if (!rootProjectionNode.current) return
        rootProjectionNode.current.isUpdating = false
        rootProjectionNode.current.blockUpdate()
        cb?.()
    }, [])
    return startTransition
}
