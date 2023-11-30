import { Batcher } from "../../frameloop/types"
import { transformProps } from "../../render/html/utils/transform"
import type { MotionValue } from "../../value"
import { appearAnimationStore } from "./store"
import { appearStoreId } from "./store-id"

export function handoffOptimizedAppearAnimation(
    id: string,
    name: string,
    /**
     * Legacy argument. This function is inlined apart from framer-motion so
     * will co-ordinate with Shuang with how best to remove this.
     */
    _value: MotionValue,
    /**
     * This function is loaded via window by startOptimisedAnimation.
     * By accepting `sync` as an argument, rather than using it via
     * import, it can be kept out of the first-load Framer bundle,
     * while also allowing this function to not be included in
     * Framer Motion bundles where it's not needed.
     */
    frame: Batcher
): number {
    const storeId = appearStoreId(
        id,
        transformProps.has(name) ? "transform" : name
    )

    const appearAnimation = appearAnimationStore.get(storeId)

    if (!appearAnimation) return 0

    const { animation, startTime } = appearAnimation

    const cancelOptimisedAnimation = () => {
        /**
         * Once we've handed animations off, we can delete the global reference.
         */
        window.HandoffAppearAnimations = false

        appearAnimationStore.delete(storeId)

        /**
         * Animation.cancel() throws so it needs to be wrapped in a try/catch
         */
        try {
            animation.cancel()
        } catch (e) {}
    }

    if (startTime !== null) {
        /**
         * We allow the animation to persist until the next frame:
         *   1. So it continues to play until Framer Motion is ready to render
         *      (avoiding a potential flash of the element's original state)
         *   2. As all independent transforms share a single transform animation, stopping
         *      it synchronously would prevent subsequent transforms from handing off.
         */
        frame.render(cancelOptimisedAnimation)

        /**
         * We use main thread timings vs those returned by Animation.currentTime as it
         * can be the case, particularly in Firefox, that currentTime doesn't return
         * an updated value for several frames, even as the animation plays smoothly via
         * the GPU.
         */
        return performance.now() - startTime || 0
    } else {
        cancelOptimisedAnimation()
        return 0
    }
}
