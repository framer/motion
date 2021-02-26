import { useCallback } from "react"
import { extractEventInfo } from "../../../events/event-info"
import { VisualElement } from "../../types"
import { AnimationType } from "../../utils/animation-state"
import { Object3DMotionProps } from "../types"
export function useHoverGesture(
    {
        whileHover,
        onHoverStart,
        onHoverEnd,
        onPointerOver,
        onPointerOut,
    }: Object3DMotionProps,
    visualElement: VisualElement
) {
    const handlePointerOver = useCallback(
        (e) => {
            visualElement.animationState?.setActive(AnimationType.Hover, true)
            onHoverStart?.(e, extractEventInfo(e))
            onPointerOver?.(e)
        },
        [visualElement]
    )

    const handlePointerOut = useCallback(
        (e) => {
            visualElement.animationState?.setActive(AnimationType.Hover, false)
            onHoverEnd?.(e, extractEventInfo(e))
            onPointerOut?.(e)
        },
        [visualElement]
    )

    return whileHover
        ? {
              onPointerOver: handlePointerOver,
              onPointerOut: handlePointerOut,
          }
        : {}
}
