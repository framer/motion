import { pipe } from "popmotion"
import { useCallback, useRef } from "react"
import { addPointerEvent } from "../../../events/use-pointer-event"
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
    const isPressing = useRef(false)
    const cancelPointerEndListeners = useRef<Function | null>(null)

    function removePointerEndListener() {
        cancelPointerEndListeners.current?.()
        cancelPointerEndListeners.current = null
    }

    function onPointerEnd() {
        removePointerEndListener()
        isPressing.current = false
        visualElement.animationState?.setActive(AnimationType.Tap, false)
    }

    const handlePointerDown = useCallback(
        (e) => {
            removePointerEndListener()
            if (isPressing.current) return
            isPressing.current = true
            visualElement.animationState?.setActive(AnimationType.Tap, true)
            cancelPointerEndListeners.current = pipe(
                addPointerEvent(window, "pointerup", onPointerEnd),
                addPointerEvent(window, "pointercancel", onPointerEnd)
            )
            // onHoverStart?.()
            onPointerDown?.(e)
        },
        [visualElement]
    )

    return whileTap
        ? {
              onPointerDown: handlePointerDown,
          }
        : {}
}
