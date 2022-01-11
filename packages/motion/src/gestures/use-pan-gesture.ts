import { useRef, useContext, useEffect } from "react"
import { MotionConfigContext } from "../context/MotionConfigContext"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { usePointerEvent } from "../events/use-pointer-event"
import { PanSession, PanInfo, AnyPointerEvent } from "./PanSession"
import { FeatureProps } from "../motion/features/types"

/**
 *
 * @param handlers -
 * @param ref -
 *
 * @internalremarks
 * Currently this sets new pan gesture functions every render. The memo route has been explored
 * in the past but ultimately we're still creating new functions every render. An optimisation
 * to explore is creating the pan gestures and loading them into a `ref`.
 *
 * @internal
 */
export function usePanGesture({
    onPan,
    onPanStart,
    onPanEnd,
    onPanSessionStart,
    visualElement,
}: FeatureProps) {
    const hasPanEvents = onPan || onPanStart || onPanEnd || onPanSessionStart
    const panSession = useRef<PanSession | null>(null)
    const { transformPagePoint } = useContext(MotionConfigContext)

    const handlers = {
        onSessionStart: onPanSessionStart,
        onStart: onPanStart,
        onMove: onPan,
        onEnd: (
            event: MouseEvent | TouchEvent | PointerEvent,
            info: PanInfo
        ) => {
            panSession.current = null
            onPanEnd && onPanEnd(event, info)
        },
    }

    useEffect(() => {
        if (panSession.current !== null) {
            panSession.current.updateHandlers(handlers)
        }
    })

    function onPointerDown(event: AnyPointerEvent) {
        panSession.current = new PanSession(event, handlers, {
            transformPagePoint,
        })
    }

    usePointerEvent(visualElement, "pointerdown", hasPanEvents && onPointerDown)

    useUnmountEffect(() => panSession.current && panSession.current.end())
}
