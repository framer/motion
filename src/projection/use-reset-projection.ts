import * as React from "react"
import { rootProjectionNode } from "./node/HTMLProjectionNode"

export function useResetProjection() {
    const reset = React.useCallback(() => {
        const root = rootProjectionNode.current
        if (!root) return
        root.clearMeasurements()
        root.sharedNodes.clear()
    }, [])

    return reset
}
