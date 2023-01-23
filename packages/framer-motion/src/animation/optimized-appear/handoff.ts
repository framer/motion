import { Sync } from "../../frameloop/types"
import { transformProps } from "../../render/html/utils/transform"
import type { MotionValue } from "../../value"
import { appearAnimationStore } from "./store"
import { appearStoreId } from "./store-id"

export function handoffOptimizedAppearAnimation(
    id: string,
    name: string,
    value: MotionValue,
    /**
     * This function is loaded via window by startOptimisedAnimation.
     * By accepting `sync` as an argument, rather than using it via
     * import, it can be kept out of the first-load Framer bundle,
     * while also allowing this function to not be included in
     * Framer Motion bundles where it's not needed.
     */
    sync: Sync
): number {
    const storeId = appearStoreId(
        id,
        transformProps.has(name) ? "transform" : name
    )

    const { animation, ready } = appearAnimationStore.get(storeId) || {}

    if (!animation) return 0

    const cancelOptimisedAnimation = () => {
        appearAnimationStore.delete(storeId)

        /**
         * Animation.cancel() throws so it needs to be wrapped in a try/catch
         */
        try {
            animation.cancel()
        } catch (e) {}
    }

    if (ready) {
        const sampledTime = performance.now()

        /**
         * Resync handoff animation with optimised animation.
         *
         * This step would be unnecessary if we triggered animateChanges() in useEffect,
         * but due to potential hydration errors we currently fire them in useLayoutEffect.
         *
         * By the time we're safely ready to cancel the optimised WAAPI animation,
         * the main thread might have been blocked and desynced the two animations.
         *
         * Here, we resync the two animations before the optimised WAAPI animation is cancelled.
         */
        sync.update(() => {
            if (value.animation) {
                value.animation.currentTime = performance.now() - sampledTime
            }
        })

        /**
         * We allow the animation to persist until the next frame:
         *   1. So it continues to play until Framer Motion is ready to render
         *      (avoiding a potential flash of the element's original state)
         *   2. As all independent transforms share a single transform animation, stopping
         *      it synchronously would prevent subsequent transforms from handing off.
         */
        sync.render(cancelOptimisedAnimation)

        return animation.currentTime || 0
    } else {
        cancelOptimisedAnimation()
        return 0
    }
}
