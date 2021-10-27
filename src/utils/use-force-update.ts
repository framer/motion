import React from "react"
const { useState, useCallback, useRef } = React
import { useUnmountEffect } from "./use-unmount-effect"

export function useForceUpdate(): [VoidFunction, number] {
    const unloadingRef = useRef(false)
    const [forcedRenderCount, setForcedRenderCount] = useState(0)
    useUnmountEffect(() => (unloadingRef.current = true))

    return [
        useCallback(() => {
            !unloadingRef.current && setForcedRenderCount(forcedRenderCount + 1)
        }, [forcedRenderCount]),
        forcedRenderCount,
    ]
}
