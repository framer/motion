import sync from "framesync"
import { useEffect } from "react"
import { useInstantLayoutTransition } from ".."
import { useForceUpdate } from "./use-force-update"

export const instantAnimationState = {
    current: false,
}

export function useInstantTransition() {
    const [forceUpdate, forcedRenderCount] = useForceUpdate()
    const startInstantLayoutTransition = useInstantLayoutTransition()

    useEffect(() => {
        sync.postRender(() => {
            instantAnimationState.current = false
        })
    }, [forcedRenderCount])

    return (callback: () => void) => {
        startInstantLayoutTransition(() => {
            instantAnimationState.current = true
            forceUpdate()
            callback()
        })
    }
}
