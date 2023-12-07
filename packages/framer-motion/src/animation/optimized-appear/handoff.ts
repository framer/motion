import { transformProps } from "../../render/html/utils/transform"
import { appearAnimationStore } from "./store"
import { appearStoreId } from "./store-id"

let handoffFrameTime: number

export function handoffOptimizedAppearAnimation(
    elementId: string,
    valueName: string
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
        try {
            animation.cancel()
        } catch (error) {}
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
