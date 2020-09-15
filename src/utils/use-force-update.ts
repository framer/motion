import { useState, useCallback, useRef, useEffect } from "react"

export function useForceUpdate() {
    const unloadingRef = useRef(false)
    const [forcedRenderCount, setForcedRenderCount] = useState(0)

    useEffect(() => {
        return () => {
            unloadingRef.current = true
        }
    }, [])

    return useCallback(() => {
        if (unloadingRef.current) {
            return
        }

        setForcedRenderCount(forcedRenderCount + 1)
    }, [forcedRenderCount])
}
