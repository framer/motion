import { frame } from "../frameloop"
import { useEffect, useRef } from "react"
import { useInstantLayoutTransition } from "../projection/use-instant-layout-transition"
import { useForceUpdate } from "./use-force-update"
import { instantAnimationState } from "./use-instant-transition-state"

export function useInstantTransition() {
    const [forceUpdate, forcedRenderCount] = useForceUpdate()
    const startInstantLayoutTransition = useInstantLayoutTransition()
    const unlockOnFrameRef = useRef<number>()

    useEffect(() => {
        /**
         * Unblock after two animation frames, otherwise this will unblock too soon.
         */
        frame.postRender(() =>
            frame.postRender(() => {
                /**
                 * If the callback has been called again after the effect
                 * triggered this 2 frame delay, don't unblock animations. This
                 * prevents the previous effect from unblocking the current
                 * instant transition too soon. This becomes more likely when
                 * used in conjunction with React.startTransition().
                 */
                if (forcedRenderCount !== unlockOnFrameRef.current) return
                instantAnimationState.current = false
            })
        )
    }, [forcedRenderCount])

    return (callback: () => void) => {
        startInstantLayoutTransition(() => {
            instantAnimationState.current = true
            forceUpdate()
            callback()
            unlockOnFrameRef.current = forcedRenderCount + 1
        })
    }
}
