import { MeshProps } from "@react-three/fiber"
import { useRef } from "react"
import {
    addPointerEvent,
    isDragActive,
    addPointerInfo,
    AnimationType,
    pipe,
} from "framer-motion"
import type { VisualElement, EventInfo } from "framer-motion"
import { ThreeMotionProps } from "../../types"

export function useTap(
    isStatic: boolean,
    {
        whileTap,
        onTapStart,
        onTap,
        onTapCancel,
        onPointerDown,
    }: ThreeMotionProps & MeshProps,
    visualElement?: VisualElement
) {
    const isTapEnabled = onTap || onTapStart || onTapCancel || whileTap
    const isPressing = useRef(false)
    const cancelPointerEndListeners = useRef<Function | null>(null)

    if (isStatic || !visualElement || !isTapEnabled) return {}

    function removePointerEndListener() {
        cancelPointerEndListeners.current?.()
        cancelPointerEndListeners.current = null
    }

    function checkPointerEnd() {
        removePointerEndListener()
        isPressing.current = false
        visualElement!.animationState?.setActive(AnimationType.Tap, false)
        return !isDragActive()
    }

    function onPointerUp(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        /**
         * We only count this as a tap gesture if the event.target is the same
         * as, or a child of, this component's element
         */
        onTap?.(event, info)
    }

    function onPointerCancel(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        onTapCancel?.(event, info)
    }

    return {
        onPointerDown: addPointerInfo((event: any, info) => {
            removePointerEndListener()
            if (isPressing.current) return
            isPressing.current = true

            /**
             * Only set listener to passive if there are no external listeners.
             */
            const options = {
                passive: !(onTapStart || onTap || onTapCancel || onPointerDown),
            }

            cancelPointerEndListeners.current = pipe(
                addPointerEvent(window, "pointerup", onPointerUp, options),
                addPointerEvent(
                    window,
                    "pointercancel",
                    onPointerCancel,
                    options
                )
            )

            visualElement.animationState?.setActive(AnimationType.Tap, true)

            onPointerDown?.(event)

            onTapStart?.(event, info)
        }),
    }
}
