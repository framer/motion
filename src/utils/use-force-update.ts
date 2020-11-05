import { useState, useCallback, useRef } from "react"
import { useUnmountEffect } from "./use-unmount-effect"

export function useForceUpdate() {
    const unloadingRef = useRef(false)
    const [forcedRenderCount, setForcedRenderCount] = useState(0)

    useUnmountEffect(() => (unloadingRef.current = true))

    return useCallback(() => {
        !unloadingRef.current && setForcedRenderCount(forcedRenderCount + 1)
    }, [forcedRenderCount])
}
