import { useState, useCallback } from "react"

export function useForceRender() {
    const [forcedRenderCount, setForcedRenderCount] = useState(0)

    return useCallback(() => setForcedRenderCount(forcedRenderCount + 1), [
        forcedRenderCount,
    ])
}
