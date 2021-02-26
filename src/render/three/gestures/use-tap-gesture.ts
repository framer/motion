import { pipe } from "popmotion"
import { useCallback, useRef } from "react"
import { extractEventInfo } from "../../../events/event-info"
import { addPointerEvent } from "../../../events/use-pointer-event"
import { useUnmountEffect } from "../../../utils/use-unmount-effect"
import { VisualElement } from "../../types"
import { AnimationType } from "../../utils/animation-state"
import { Object3DMotionProps } from "../types"

export function useTapGesture(
    {
        whileTap,
        onPointerDown,
        onPointerUp,
        onTapStart,
        onTap,
        onTapCancel,
    }: Object3DMotionProps,
    visualElement: VisualElement
) {
    const hasPressListeners = onTap || onTapStart || onTapCancel || whileTap
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

    function onPointerCancel(e: PointerEvent) {
        if (!isPressing.current) return
        onPointerEnd()
        onTapCancel?.(e, extractEventInfo(e))
    }

    const handlePointerDown = useCallback(
        (e) => {
            removePointerEndListener()
            if (isPressing.current) return
            isPressing.current = true
            visualElement.animationState?.setActive(AnimationType.Tap, true)
            cancelPointerEndListeners.current = pipe(
                addPointerEvent(window, "pointerup", onPointerCancel),
                addPointerEvent(window, "pointercancel", onPointerCancel)
            )
            onTapStart?.(e, extractEventInfo(e))
            onPointerDown?.(e)
        },
        [visualElement]
    )

    const handlePointerUp = useCallback(
        (e) => {
            if (!isPressing.current) return
            onPointerEnd()
            onTap?.(e, extractEventInfo(e))
            onPointerUp?.(e)
        },
        [visualElement]
    )

    useUnmountEffect(removePointerEndListener)

    return hasPressListeners
        ? {
              onPointerDown: handlePointerDown,
              onPointerUp: handlePointerUp,
          }
        : {}
}
