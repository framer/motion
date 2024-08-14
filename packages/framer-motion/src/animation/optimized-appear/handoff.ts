import type { Batcher } from "../../frameloop/types"
import { transformProps } from "../../render/html/utils/transform"
import { appearAnimationStore } from "./store"
import { appearStoreId } from "./store-id"
import { HandoffInfo } from "./types"

let handoffFrameTime: number

export function handoffOptimizedAppearAnimation(
    elementId: string,
    valueName: string,
    frame: Batcher
): HandoffInfo | null {
    const optimisedValueName = transformProps.has(valueName)
        ? "transform"
        : valueName
    const storeId = appearStoreId(elementId, optimisedValueName)
    const optimisedAnimation = appearAnimationStore.get(storeId)

    if (!optimisedAnimation) {
        return null
    }

    const { animation, startTime } = optimisedAnimation

    if (startTime === null || window.MotionHandoffIsComplete) {
        /**
         * If the startTime is null, this animation is the Paint Ready detection animation
         * and we can cancel it immediately without handoff.
         *
         * Or if we've already handed off the animation then we're now interrupting it.
         * In which case we need to cancel it.
         */
        appearAnimationStore.delete(storeId)

        frame.render(() =>
            frame.render(() => {
                try {
                    animation.cancel()
                } catch (error) {}
            })
        )

        return null
    } else {
        /**
         * Otherwise we're starting a main thread animation.
         *
         * Record the time of the first handoff. We call performance.now() once
         * here and once in startOptimisedAnimation to ensure we're getting
         * close to a frame-locked time. This keeps all animations in sync.
         */
        if (handoffFrameTime === undefined) {
            handoffFrameTime = performance.now()
        }

        if (
            new URLSearchParams(window.location.search).get(
                "use-animation-timing"
            ) === "true"
        ) {
            return {
                elapsed: animation.currentTime as number,
                startTime: startTime + (animation.currentTime as number),
            }
        } else if (
            new URLSearchParams(window.location.search).get(
                "use-start-time"
            ) === "true"
        ) {
            return {
                elapsed: 0,
                startTime: startTime,
            }
        }

        /**
         * We use main thread timings vs those returned by Animation.currentTime as it
         * can be the case, particularly in Firefox, that currentTime doesn't return
         * an updated value for several frames, even as the animation plays smoothly via
         * the GPU.
         */
        return {
            elapsed: handoffFrameTime - startTime || 0,
            startTime: handoffFrameTime,
        }
    }
}
