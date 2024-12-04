import type { VisualElement } from "../render/VisualElement"
import { Feature } from "../motion/features/Feature"
import { frame } from "../frameloop"
import { hover } from "motion-dom"
import { extractEventInfo } from "../events/event-info"
import { MotionProps } from "../motion/types"

function handleHoverEvent(
    node: VisualElement<Element>,
    event: PointerEvent,
    lifecycle: "Start" | "End"
) {
    const { props } = node

    if (node.animationState && props.whileHover) {
        node.animationState.setActive("whileHover", lifecycle === "Start")
    }

    const callback = props[("onHover" + lifecycle) as keyof MotionProps]
    if (callback) {
        frame.postRender(() => callback(event, extractEventInfo(event)))
    }
}

export class HoverGesture extends Feature<Element> {
    mount() {
        const { current } = this.node
        if (!current) return

        this.unmount = hover(current, (startEvent) => {
            handleHoverEvent(this.node, startEvent, "Start")

            return (endEvent) => handleHoverEvent(this.node, endEvent, "End")
        })
    }

    unmount() {}
}
