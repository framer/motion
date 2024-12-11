import { Feature } from "../motion/features/Feature"
import { press } from "motion-dom"
import { VisualElement } from "../render/VisualElement"
import { frame } from "../frameloop"
import { extractEventInfo } from "../events/event-info"

function handlePressEvent(
    node: VisualElement<Element>,
    event: PointerEvent,
    lifecycle: "Start" | "End" | "Cancel"
) {
    const { props } = node

    if (node.animationState && props.whileTap) {
        node.animationState.setActive("whileTap", lifecycle === "Start")
    }

    const eventName = ("onTap" + lifecycle === "End" ? "" : lifecycle) as
        | "onTapStart"
        | "onTap"
        | "onTapCancel"
    const callback = props[eventName]
    if (callback) {
        frame.postRender(() => callback(event, extractEventInfo(event)))
    }
}

export class PressGesture extends Feature<Element> {
    mount() {
        const { current } = this.node
        if (!current) return

        this.unmount = press(current, (startEvent) => {
            handlePressEvent(this.node, startEvent, "Start")

            return (endEvent, { success }) =>
                handlePressEvent(
                    this.node,
                    endEvent,
                    success ? "End" : "Cancel"
                )
        })
    }

    unmount() {}
}
