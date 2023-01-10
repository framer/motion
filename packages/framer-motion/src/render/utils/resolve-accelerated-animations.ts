import { acceleratedValues } from "../../animation/waapi/supports"
import { Target } from "../../types"
import { VisualElement } from "../VisualElement"

export function resolveAcceleratedAnimations(
    visualElement: VisualElement,
    target: Target
) {
    for (const key in target) {
        if (!acceleratedValues.has(key)) continue

        const motionValue = visualElement.getValue(key)

        if (!motionValue) continue

        if (motionValue.isAnimating() && !motionValue.isTrusted) {
            motionValue.stop()
            motionValue.jump(visualElement.readValue(key))
        }
    }
}
