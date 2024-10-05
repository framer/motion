import { cancelFrame } from "../../../frameloop"
import { visualElementStore } from "../../store"
import type { VisualElement } from "../../VisualElement"

export function unmountVisualElement(element: VisualElement) {
    visualElementStore.delete(element.current)
    element.projection && element.projection.unmount()
    cancelFrame(element.notifyUpdate)
    cancelFrame(element.render)
    element.valueSubscriptions.forEach((remove) => remove())
    element.valueSubscriptions.clear()
    element.removeFromVariantTree && element.removeFromVariantTree()
    element.parent && element.parent.children.delete(element)

    for (const key in element.events) {
        element.events[key].clear()
    }

    for (const key in element.features) {
        const feature = element.features[key as keyof typeof element.features]
        if (feature) {
            feature.unmount()
            feature.isMounted = false
        }
    }
    element.current = null
}
