import { useRef } from "react"
import { EventInfo } from "../events/types"
import { isNodeOrChild } from "./utils/is-node-or-child"
import { addPointerEvent, usePointerEvent } from "../events/use-pointer-event"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { pipe } from "popmotion"
import { AnimationType } from "../render/utils/types"
import { isDragActive } from "./drag/utils/lock"
import { FeatureProps } from "../motion/features/types"

/**
 * @param handlers -
 * @internal
 */
export function useTapGesture({
    onTap,
    onTapStart,
    onTapCancel,
    whileTap,
    visualElement,
}: FeatureProps) {
    const hasPressListeners = onTap || onTapStart || onTapCancel || whileTap
    const isPressing = useRef(false)
    const cancelPointerEndListeners = useRef<Function | null>(null)

    /**
     * Only set listener to passive if there are no external listeners.
     */
    const eventOptions = {
        passive: !(onTapStart || onTap || onTapCancel || onPointerDown),
    }

    function removePointerEndListener() {
        cancelPointerEndListeners.current && cancelPointerEndListeners.current()
        cancelPointerEndListeners.current = null
    }

    function checkPointerEnd() {
        removePointerEndListener()
        isPressing.current = false
        visualElement.animationState &&
            visualElement.animationState.setActive(AnimationType.Tap, false)
        return !isDragActive()
    }

    function onPointerUp(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        /**
         * We only count this as a tap gesture if the event.target is the same
         * as, or a child of, this component's element
         */
        !isNodeOrChild(visualElement.current, event.target as Element)
            ? onTapCancel && onTapCancel(event, info)
            : onTap && onTap(event, info)
    }

    function onPointerCancel(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        onTapCancel && onTapCancel(event, info)
    }

    function onPointerDown(event: PointerEvent, info: EventInfo) {
        removePointerEndListener()

        if (isPressing.current) return
        isPressing.current = true

        cancelPointerEndListeners.current = pipe(
            addPointerEvent(window, "pointerup", onPointerUp, eventOptions),
            addPointerEvent(
                window,
                "pointercancel",
                onPointerCancel,
                eventOptions
            )
        )

        /**
         * Ensure we trigger animations before firing event callback
         */
        visualElement.animationState &&
            visualElement.animationState.setActive(AnimationType.Tap, true)

        onTapStart && onTapStart(event, info)
    }

    usePointerEvent(
        visualElement,
        "pointerdown",
        hasPressListeners ? onPointerDown : undefined,
        eventOptions
    )

    useUnmountEffect(removePointerEndListener)
}
