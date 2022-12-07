import { sync } from "../../frameloop"
import { transformProps } from "../../render/html/utils/transform"
import { appearStoreId } from "./store-id"

export function handoffAppearAnimation(id: string, name: string): number {
    const { MotionAppearAnimations } = window

    const animation =
        MotionAppearAnimations &&
        MotionAppearAnimations.get(
            appearStoreId(id, transformProps.has(name) ? "transform" : name)
        )

    if (animation) {
        sync.update(() => {
            try {
                animation.cancel()
            } catch (e) {}
        })

        return animation.currentTime || 0
    } else {
        return 0
    }
}
