import { EventInfo } from "../events/types"
import { AnimationType } from "../render/utils/types"
import { usePointerEvent } from "../events/use-pointer-event"
import type { VisualElement } from "../render/VisualElement"
import { FeatureProps } from "../motion/features/types"
import { isDragActive } from "./drag/utils/lock"
import { useMemo } from "react"

function createHoverEvent(
    visualElement: VisualElement,
    isActive: boolean,
    callback?: (event: PointerEvent, info: EventInfo) => void
) {
    return (event: PointerEvent, info: EventInfo) => {
        if (event.type === "touch" || isDragActive()) return

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
        useMemo(() => {
            return onHoverStart || whileHover
                ? createHoverEvent(visualElement, true, onHoverStart)
                : undefined
        }, [onHoverStart, Boolean(whileHover), visualElement]),
        { passive: !onHoverStart }
    )

    usePointerEvent(
        visualElement,
        "pointerleave",
        useMemo(() => {
            return onHoverEnd || whileHover
                ? createHoverEvent(visualElement, false, onHoverEnd)
                : undefined
        }, [onHoverStart, Boolean(whileHover), visualElement]),
        { passive: !onHoverEnd }
    )
}
