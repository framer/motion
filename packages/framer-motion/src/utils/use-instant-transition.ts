import { sync } from "../frameloop"
import { useEffect } from "react"
import { useInstantLayoutTransition } from "../projection/use-instant-layout-transition"
import { useForceUpdate } from "./use-force-update"
import { instantAnimationState } from "./use-instant-transition-state"

export function useInstantTransition() {
    const [forceUpdate, forcedRenderCount] = useForceUpdate()
    const startInstantLayoutTransition = useInstantLayoutTransition()

    useEffect(() => {
        /**
         * Unblock after two animation frames, otherwise this will unblock too soon.
         */
        sync.postRender(() =>
            sync.postRender(() => (instantAnimationState.current = false))
        )
    }, [forcedRenderCount])

    return (callback: () => void) => {
        startInstantLayoutTransition(() => {
            instantAnimationState.current = true
            forceUpdate()
            callback()
        })
    }
}
