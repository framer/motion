import { WillChangeMotionValue } from "./WillChangeMotionValue"
import type { VisualElement } from "../../render/VisualElement"
import { isWillChangeMotionValue } from "./is"

export function addValueToWillChange(
    visualElement: VisualElement,
    key: string
) {
    if (!visualElement.applyWillChange) return

    let willChange = visualElement.getValue("willChange")

    /**
     * If we haven't created a willChange MotionValue, and the we haven't been
     * manually provided one, create one.
     */
    if (!willChange && !visualElement.props.style?.willChange) {
        willChange = new WillChangeMotionValue("auto")
        visualElement.addValue("willChange", willChange)
    }

    /**
     * It could be that a user has set willChange to a regular MotionValue,
     * in which case we can't add the value to it.
     */
    if (isWillChangeMotionValue(willChange)) {
        return willChange.add(key)
    }
}
