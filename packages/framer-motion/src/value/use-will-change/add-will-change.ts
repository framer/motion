import type { VisualElement } from "../../render/VisualElement"
import { isWillChangeMotionValue } from "./is"
import { getWillChangeName } from "./get-will-change-name"

export function addValueToWillChange(
    visualElement: VisualElement,
    key: string
) {
    if (!visualElement.applyWillChange) return

    const willChange = visualElement.getValue("willChange")

    if (isWillChangeMotionValue(willChange)) {
        return willChange.add(key)
    } else if (
        !visualElement.props.style?.willChange &&
        getWillChangeName(key)
    ) {
        visualElement.setStaticValue("willChange", "transform")
    }
}
