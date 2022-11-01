import type { VisualElement } from "../VisualElement"

export function isDraggable(visualElement: VisualElement) {
    const { drag, _dragX } = visualElement.getProps()
    return drag && !_dragX
}
