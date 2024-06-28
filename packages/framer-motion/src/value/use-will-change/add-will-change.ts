import { WillChangeMotionValue } from "."
import type { VisualElement } from "../../render/VisualElement"

export function addValueToWillChange(
    visualElement: VisualElement,
    key: string
) {
    if (!visualElement.applyWillChange) return

    let willChange = visualElement.getValue(
        "willChange"
    ) as WillChangeMotionValue

    /**
     * TODO: Ensure tests cover manually-added willChange static and motion values
     */
    if (!willChange) {
        willChange = new WillChangeMotionValue("auto")
        visualElement.addValue("willChange", willChange)
    }

    return willChange.add(key)
}
