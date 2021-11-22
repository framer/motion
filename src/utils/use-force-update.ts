import sync from "framesync"
import { useState, useCallback, useRef } from "react"
import { useUnmountEffect } from "./use-unmount-effect"

export function useForceUpdate(): [VoidFunction, number] {
    const unloadingRef = useRef(false)
    const [forcedRenderCount, setForcedRenderCount] = useState(0)
    useUnmountEffect(() => (unloadingRef.current = true))

    const forceRender = useCallback(() => {
        !unloadingRef.current && setForcedRenderCount(forcedRenderCount + 1)
    }, [forcedRenderCount])

    /**
     * Defer this to  the end of the next animation frame in case there are multiple
     * synchronous calls.
     */
    const deferredForceRender = useCallback(
        () => sync.postRender(forceRender),
        [forceRender]
    )

    return [deferredForceRender, forcedRenderCount]
}
