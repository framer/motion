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
    const { props } = node

    if (node.animationState && props.whileHover) {
        node.animationState.setActive("whileHover", isActive)
    }

    const callback = props[isActive ? "onHoverStart" : "onHoverEnd"]
    if (callback) {
        frame.postRender(() => callback(event, extractEventInfo(event)))
    }
}

export class HoverGesture extends Feature<Element> {
    mount() {
        const { current, props } = this.node
        if (!current) return

        this.unmount = hover(
            current,
            (startEvent) => {
                handleHoverEvent(this.node, startEvent, true)

                return (endEvent) =>
                    handleHoverEvent(this.node, endEvent, false)
            },
            { passive: !props.onHoverStart && !props.onHoverEnd }
        )
    }

    unmount() {}
}
