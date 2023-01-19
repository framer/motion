import { sync } from "../../frameloop"
import { transformProps } from "../../render/html/utils/transform"
import { MotionValue } from "../../value"
import { appearStoreId } from "./store-id"

export function handoffOptimizedAppearAnimation(
    id: string,
    name: string,
    value: MotionValue
): number {
    const { MotionAppearAnimations } = window

    const animationId = appearStoreId(
        id,
        transformProps.has(name) ? "transform" : name
    )

    const { animation, ready } =
        (MotionAppearAnimations && MotionAppearAnimations.get(animationId)) ||
        {}

    if (!animation) return 0

    const cancelOptimisedAnimation = () => {
        MotionAppearAnimations!.delete(animationId)

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
        console.log(animation.currentTime)
        return animation.currentTime || 0
    } else {
        cancelOptimisedAnimation()
        return 0
    }
}
