import { isMouseEvent } from "./utils/event-type"
import { EventInfo } from "../events/types"
import { AnimationType } from "../render/utils/types"
import { usePointerEvent } from "../events/use-pointer-event"
import { VisualElement } from "../render/types"
import { FeatureProps } from "../motion/features/types"

function createHoverEvent(
    visualElement: VisualElement,
    isActive: boolean,
    callback?: (event: MouseEvent, info: EventInfo) => void
) {
    return (event: MouseEvent, info: EventInfo) => {
        if (!isMouseEvent(event) || !visualElement.isHoverEventsEnabled) return
        callback?.(event, info)
        visualElement.animationState?.setActive(AnimationType.Hover, isActive)
    }
}

export function useHoverGesture({
    onHoverStart,
    onHoverEnd,
    whileHover,
    visualElement,
}: FeatureProps) {
    usePointerEvent(
        visualElement,
        "pointerenter",
        onHoverStart || whileHover
            ? createHoverEvent(visualElement, true, onHoverStart)
            : undefined
    )

    usePointerEvent(
        visualElement,
        "pointerleave",
        onHoverEnd || whileHover
            ? createHoverEvent(visualElement, false, onHoverEnd)
            : undefined
    )
}
