import { transformProps } from "../../render/html/utils/transform"
import type { MotionValue } from "../../value"
import { appearAnimationStore } from "./store"
import { appearStoreId } from "./store-id"

let handoffFrameTime: number

export function handoffOptimizedAppearAnimation(
    id: string,
    name: string,
    value: MotionValue
): number {
    const storeId = appearStoreId(
        id,
        transformProps.has(name) ? "transform" : name
    )

    const appearAnimation = appearAnimationStore.get(storeId)

    if (!appearAnimation) return 0

    const { animation, startTime } = appearAnimation

    const cancelOptimisedAnimation = () => {
        appearAnimationStore.delete(storeId)
        delete value.cancelHandoffAnimation

        /**
         * Animation.cancel() throws so it needs to be wrapped in a try/catch
         */
        try {
            animation.cancel()
        } catch (e) {}
    }

    if (startTime !== null) {
        value.cancelHandoffAnimation = cancelOptimisedAnimation

        /**
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
    } else {
        cancelOptimisedAnimation()
        return 0
    }
}
