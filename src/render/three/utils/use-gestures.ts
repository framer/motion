import { useCallback } from "react"
import { MotionProps } from "../../../motion/types"
import { VisualElement } from "../../types"
import { AnimationType } from "../../utils/animation-state"

export function useGestures(props: MotionProps, visualElement: VisualElement) {
    return {
        ...useHoverGesture(props, visualElement),
        ...useTapGesture(props, visualElement),
    }
}

function useHoverGesture(
    { whileHover, onPointerOver, onPointerOut }: MotionProps,
    visualElement: VisualElement
) {
    const handlePointerOver = useCallback(
        (e) => {
            visualElement.animationState?.setActive(AnimationType.Hover, true)
            // onHoverStart?.()
            onPointerOver?.(e)
        },
        [visualElement]
    )

    const handlePointerOut = useCallback(
        (e) => {
            visualElement.animationState?.setActive(AnimationType.Hover, false)
            // onHoverEnd?.()
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

function useTapGesture(
    { whileTap, onPointerDown, onPointerUp }: MotionProps,
    visualElement: VisualElement
) {
    const handlePointerDown = useCallback(
        (e) => {
            visualElement.animationState?.setActive(AnimationType.Tap, true)
            // onHoverStart?.()
            onPointerDown?.(e)
        },
        [visualElement]
    )

    const handlePointerUp = useCallback(
        (e) => {
            visualElement.animationState?.setActive(AnimationType.Tap, false)
            // onHoverEnd?.()
            onPointerUp?.(e)
        },
        [visualElement]
    )

    return whileTap
        ? {
              onPointerDown: handlePointerDown,
              onPointerUp: handlePointerUp,
          }
        : {}
}
