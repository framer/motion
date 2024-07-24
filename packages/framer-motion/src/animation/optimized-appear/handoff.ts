import type { Batcher } from "../../frameloop/types"
import type { MotionValue } from "../../value"
import { transformProps } from "../../render/html/utils/transform"
import { appearAnimationStore } from "./store"
import { appearStoreId } from "./store-id"
import "./types"

let handoffFrameTime: number

export function handoffOptimizedAppearAnimation(
    elementId: string,
    valueName: string,
    /**
     * Legacy arguments. This function is inlined as part of SSG so it can be there's
     * a version mismatch between the main included Motion and the inlined script.
     *
     * Remove in early 2024.
     */
    _value?: MotionValue,
    frame?: Batcher
): number | null {
    const optimisedValueName = transformProps.has(valueName)
        ? "transform"
        : valueName
    const storeId = appearStoreId(elementId, optimisedValueName)
    const optimisedAnimation = appearAnimationStore.get(storeId)

    if (!optimisedAnimation) {
        return null
    }

    const { animation, startTime } = optimisedAnimation

    const cancelAnimation = () => {
        appearAnimationStore.delete(storeId)

        if (frame) {
            /**
             * If we've been provided the frameloop as an argument, use it to defer
             * cancellation until keyframes of the subsequent animation have been resolved.
             * This "papers over" a gap where the JS animations haven't rendered with
             * the latest time after a potential heavy blocking workload.
             * Otherwise cancel immediately.
             *
             * This is an optional dependency to deal with the fact that this inline
             * script and the library can be version sharded, and there have been
             * times when this isn't provided as an argument.
             */
            frame.render(() =>
                frame.render(() => {
                    try {
                        animation.cancel()
                    } catch (error) {}
                })
            )
        } else {
            try {
                animation.cancel()
            } catch (error) {}
        }
    }

    /**
     * If the startTime is null, this animation is the Paint Ready detection animation
     * and we can cancel it immediately without handoff.
     *
     * Or if we've already handed off the animation then we're now interrupting it.
     * In which case we need to cancel it.
     */
    if (startTime === null || window.HandoffComplete) {
        cancelAnimation()
        return null
    } else {
        /**
         * Otherwise we're handing off this animation to the main thread.
         *
         * Record the time of the first handoff. We call performance.now() once
         * here and once in startOptimisedAnimation to ensure we're getting
         * close to a frame-locked time. This keeps all animations in sync.
         */
        if (handoffFrameTime === undefined) {
            handoffFrameTime = performance.now()
        }

        /**
         * We use main thread timings vs those returned by Animation.currentTime as it
         * can be the case, particularly in Firefox, that currentTime doesn't return
         * an updated value for several frames, even as the animation plays smoothly via
         * the GPU.
         */
        return handoffFrameTime - startTime || 0
    }
}
