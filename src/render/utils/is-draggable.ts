import { VisualElement } from "../types"

export function isDraggable(visualElement: VisualElement) {
    const { drag, _dragX } = visualElement.getProps()
    return drag && !_dragX
}
