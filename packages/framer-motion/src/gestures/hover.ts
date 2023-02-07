import { addPointerEvent } from "../events/use-pointer-event"
import { AnimationType } from "../render/utils/types"
import { noop } from "../utils/noop"
import { pipe } from "../utils/pipe"
import { isDragActive } from "./drag/utils/lock"
import { EventInfo } from "../events/types"

// TODO: Rename VisualElement as MotionNode in subsequent PR
import type { VisualElement as MotionNode } from "../render/VisualElement"

function addHoverEvent(node: MotionNode<Element>, isActive: boolean) {
    const eventName = "pointer" + (isActive ? "enter" : "leave")
    const callbackName = "onHover" + (isActive ? "Start" : "End")

    const handleEvent = (event: PointerEvent, info: EventInfo) => {
        if (event.type === "touch" || isDragActive()) return

        const props = node.getProps()

        if (node.animationState && props.whileHover) {
            node.animationState.setActive(AnimationType.Hover, isActive)
        }

        if (props[callbackName]) {
            props[callbackName](event, info)
        }
    }

    return addPointerEvent(node.current!, eventName, handleEvent, {
        passive: !node.getProps()[callbackName],
    })
}

export function hover(node: MotionNode<Element>) {
    let cleanEvents: Function = noop

    const cleanListeners = pipe(
        node.once("Effect", () => {
            cleanEvents = pipe(
                addHoverEvent(node, true),
                addHoverEvent(node, false)
            )
        }),
        node.once("Unmount", () => {
            cleanEvents()
            cleanListeners()
        })
    )

    return () => {
        cleanEvents()
        cleanListeners()
    }
}
