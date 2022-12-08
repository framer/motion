import { sync } from "../../frameloop"
import { transformProps } from "../../render/html/utils/transform"
import { appearStoreId } from "./store-id"

export function handoffOptimizedAppearAnimation(
    id: string,
    name: string
): number {
    const { MotionAppearAnimations } = window

    const animationId = appearStoreId(
        id,
        transformProps.has(name) ? "transform" : name
    )
    const animation =
        MotionAppearAnimations && MotionAppearAnimations.get(animationId)

    if (animation) {
        /**
         * We allow the animation to persist until the next frame:
         *   1. So it continues to play until Framer Motion is ready to render
         *      (avoiding a potential flash of the element's original state)
         *   2. As all independent transforms share a single transform animation, stopping
         *      it synchronously would prevent subsequent transforms from handing off.
         */
        sync.render(() => {
            try {
                animation.cancel()
                MotionAppearAnimations.delete(animationId)
            } catch (e) {}
        })

        return animation.currentTime || 0
    } else {
        return 0
    }
}
