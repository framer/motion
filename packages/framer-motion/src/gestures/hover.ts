import type { VisualElement } from "../render/VisualElement"
import { Feature } from "../motion/features/Feature"
import { frame } from "../frameloop"
import { hover } from "motion-dom"
import { extractEventInfo } from "../events/event-info"

function handleHoverEvent(
    node: VisualElement<Element>,
    event: PointerEvent,
    isActive: boolean
) {
    const callbackName = isActive ? "onHoverStart" : "onHoverEnd"
    const props = node.getProps()

    if (node.animationState && props.whileHover) {
        node.animationState.setActive("whileHover", isActive)
    }

    const callback = props[callbackName]
    if (callback) {
        frame.postRender(() => callback(event, extractEventInfo(event)))
    }
}

export class HoverGesture extends Feature<Element> {
    mount() {
        const { current } = this.node
        if (current) {
            this.unmount = hover(current, (startEvent) => {
                handleHoverEvent(this.node, startEvent, true)

                return (endEvent) =>
                    handleHoverEvent(this.node, endEvent, false)
            })
        }
    }

    unmount() {}
}
