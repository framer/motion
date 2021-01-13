import { projection } from "../projection"
import { VisualElement, VisualElementOptions } from "./types"

export function visualElement({
    parent,
    projectionId,
}: VisualElementOptions): VisualElement {
    const children = new Set<VisualElement>()

    const element: VisualElement = {
        addChild: (child) => {
            children.add(child)
            return () => children.delete(child)
        },

        destroy() {
            removeFromParent?.()

            // TODO: Remove from attached projection here, perhaps add snapshot if this is
            // a shared projection
        },

        // TODO: Make shared
        style: projection(),

        ref: () => {},
    }

    const removeFromParent = parent?.addChild(element)

    return element
}
