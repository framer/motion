import { isMouseEvent } from "./utils/event-type"
import { EventInfo } from "../events/types"
import { AnimationType } from "../render/utils/types"
import { usePointerEvent } from "../events/use-pointer-event"
import type { VisualElement } from "../render/VisualElement"
import { FeatureProps } from "../motion/features/types"
import { isDragActive } from "./drag/utils/lock"

function createHoverEvent(
    visualElement: VisualElement,
    isActive: boolean,
    callback?: (event: MouseEvent, info: EventInfo) => void
) {
    return (event: MouseEvent, info: EventInfo) => {
        if (!isMouseEvent(event) || isDragActive()) return

        /**
         * Ensure we trigger animations before firing event callback
         */
        if (visualElement.animationState) {
            visualElement.animationState.setActive(
                AnimationType.Hover,
                isActive
            )
        }
        callback && callback(event, info)
    }
}

export function useHoverGesture({
    onHoverStart,
    onHoverEnd,
    whileHover,
    visualElement,
}: FeatureProps<HTMLElement>) {
    usePointerEvent(
        visualElement,
        "pointerenter",
        onHoverStart || whileHover
            ? createHoverEvent(visualElement, true, onHoverStart)
            : undefined,
        { passive: !onHoverStart }
    )

    usePointerEvent(
        visualElement,
        "pointerleave",
        onHoverEnd || whileHover
            ? createHoverEvent(visualElement, false, onHoverEnd)
            : undefined,
        { passive: !onHoverEnd }
    )
}
