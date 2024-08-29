import type { Batcher } from "../../frameloop/types"
import { appearAnimationStore } from "./store"
import { appearStoreId } from "./store-id"

export function handoffOptimizedAppearAnimation(
    elementId: string,
    valueName: string,
    frame: Batcher
): number | null {
    const storeId = appearStoreId(elementId, valueName)
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
        return startTime
    }
}
