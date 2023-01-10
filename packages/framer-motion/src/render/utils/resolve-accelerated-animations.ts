import { ResolvedValues } from "../types"
import { VisualElement } from "../VisualElement"

export function resolveAcceleratedAnimations(
    visualElement: VisualElement,
    target: ResolvedValues
) {
    for (const key in target) {
        const motionValue = visualElement.getValue(key)
        if (
            motionValue &&
            motionValue.isAnimating() &&
            !motionValue.isTrusted
        ) {
            motionValue.stop()
            visualElement.removeValue(key)
        }
    }
}
