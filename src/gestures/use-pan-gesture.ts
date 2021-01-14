import { RefObject, useRef, useContext, useEffect } from "react"
import { EventInfo } from "../events/types"
import { MotionConfigContext } from "../motion/context/MotionConfigContext"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { usePointerEvent } from "../events/use-pointer-event"
import { PanSession, PanInfo, AnyPointerEvent } from "./PanSession"
import { VisualElement } from "../render/types"

export type PanHandler = (event: Event, info: PanInfo) => void

/**
 * @public
 */
export interface PanHandlers {
    /**
     * Callback function that fires when the pan gesture is recognised on this element.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x` and `y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPan?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void

    /**
     * Callback function that fires when the pan gesture begins on this element.
     *
     * @library
     *
     * ```jsx
     * function onPanStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPanStart={onPanStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPanStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanStart={onPanStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanStart?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ): void

    /**
     * Callback function that fires when we begin detecting a pan gesture. This
     * is analogous to `onMouseStart` or `onTouchStart`.
     *
     * @library
     *
     * ```jsx
     * function onPanSessionStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPanSessionStart={onPanSessionStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPanSessionStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanSessionStart={onPanSessionStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link EventInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     */

    onPanSessionStart?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: EventInfo
    ): void

    /**
     * Callback function that fires when the pan gesture ends on this element.
     *
     * @library
     *
     * ```jsx
     * function onPanEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPanEnd={onPanEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPanEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanEnd={onPanEnd} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanEnd?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ): void
}

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
export function usePanGesture(
    { onPan, onPanStart, onPanEnd, onPanSessionStart }: PanHandlers,
    ref: RefObject<Element> | VisualElement
) {
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

    usePointerEvent(ref, "pointerdown", hasPanEvents && onPointerDown)

    useUnmountEffect(() => panSession.current && panSession.current.end())
}
