import { RefObject, useRef, useContext } from "react"
import { distance } from "@popmotion/popcorn"
import { EventInfo, Point } from "../events/types"
import sync, { cancelSync, getFrameData } from "framesync"
import { MotionPluginContext } from "../motion/context/MotionPluginContext"
import { unblockViewportScroll } from "../behaviours/utils/block-viewport-scroll"
import { warning } from "hey-listen"
import { secondsToMilliseconds } from "../utils/time-conversion"
import { isMouseEvent, isTouchEvent } from "./utils/event-type"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { usePointerEvent, addPointerEvent } from "../events/use-pointer-event"

interface TimestampedPoint extends Point {
    timestamp: number
}

interface EventSession {
    startEvent?: Event
    target: EventTarget | null
    pointHistory: TimestampedPoint[]
}

function startDevicePoint(session: EventSession): TimestampedPoint {
    return session.pointHistory[0]
}

function lastDevicePoint(session: EventSession): TimestampedPoint {
    return session.pointHistory[session.pointHistory.length - 1]
}

function getVelocity(session: EventSession, timeDelta: number): Point {
    const { pointHistory } = session
    if (pointHistory.length < 2) {
        return { x: 0, y: 0 }
    }

    let i = pointHistory.length - 1
    let timestampedPoint: TimestampedPoint | null = null
    const lastPoint = lastDevicePoint(session)
    while (i >= 0) {
        timestampedPoint = pointHistory[i]
        if (
            lastPoint.timestamp - timestampedPoint.timestamp >
            secondsToMilliseconds(timeDelta)
        ) {
            break
        }
        i--
    }

    if (!timestampedPoint) {
        return { x: 0, y: 0 }
    }

    const time = (lastPoint.timestamp - timestampedPoint.timestamp) / 1000
    if (time === 0) {
        return { x: 0, y: 0 }
    }

    const currentVelocity = {
        x: (lastPoint.x - timestampedPoint.x) / time,
        y: (lastPoint.y - timestampedPoint.y) / time,
    }

    if (currentVelocity.x === Infinity) {
        currentVelocity.x = 0
    }
    if (currentVelocity.y === Infinity) {
        currentVelocity.y = 0
    }

    return currentVelocity
}

/**
 * Passed in to pan event handlers like `onPan` the `PanInfo` object contains
 * information about the current state of the tap gesture such as its
 * `point`, `delta`, `offset` and `velocity`.
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
 * <motion.div onPan={(event, info) => {
 *   console.log(info.point.x, info.point.y)
 * }} />
 * ```
 *
 * @public
 */
export interface PanInfo {
    /**
     * Contains `x` and `y` values for the current pan position relative
     * to the device or page.
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
     * @public
     */
    point: Point
    /**
     * Contains `x` and `y` values for the distance moved since
     * the last event.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.delta.x, info.delta.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.delta.x, info.delta.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    delta: Point
    /**
     * Contains `x` and `y` values for the distance moved from
     * the first pan event.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.offset.x, info.offset.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.offset.x, info.offset.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    offset: Point
    /**
     * Contains `x` and `y` values for the current velocity of the pointer.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    velocity: Point
}

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

type RemoveEvent = () => void

/**
 *
 * @param handlers -
 * @param ref -
 * @internal
 */
export function usePanGesture(
    { onPan, onPanStart, onPanEnd, onPanSessionStart }: PanHandlers,
    ref: RefObject<Element>
) {
    const hasPanEvents = onPan || onPanStart || onPanEnd || onPanSessionStart
    const session = useRef<EventSession | null>(null)
    const lastMoveEvent = useRef<MouseEvent | TouchEvent | PointerEvent | null>(
        null
    )
    const lastMoveEventInfo = useRef<EventInfo | null>(null)
    const { transformPagePoint } = useContext(MotionPluginContext)

    const pointerEventSubscription = useRef<RemoveEvent | null>(null)

    function removePointerEvents() {
        pointerEventSubscription.current && pointerEventSubscription.current()
        pointerEventSubscription.current = null
    }

    function getPanInfo({ point }: EventInfo) {
        const currentPoint = session.current as EventSession

        // TODO: A potential optimisation here that might be a breaking change would be
        // to keep one mutable ref to a point that we update
        return {
            point,
            delta: Point.subtract(point, lastDevicePoint(currentPoint)),
            offset: Point.subtract(point, startDevicePoint(currentPoint)),
            velocity: getVelocity(currentPoint, 0.1),
        }
    }

    function transformPoint(info: EventInfo) {
        return { point: transformPagePoint(info.point) }
    }

    function cancelPan() {
        removePointerEvents()
        cancelSync.update(updatePoint)
        unblockViewportScroll()
    }

    function updatePoint() {
        if (
            !session.current ||
            !lastMoveEvent.current ||
            !lastMoveEventInfo.current
        ) {
            warning(false, "onPointerMove fired without pointer session")
            cancelPan()
            return
        }

        const info = getPanInfo(lastMoveEventInfo.current)
        const panStarted = session.current.startEvent !== undefined

        // Only start panning if the offset is larger than 3 pixels. If we make it
        // any larger than this we'll want to reset the pointer history
        // on the first update to avoid visual snapping to the cursoe.
        const distancePastThreshold = distance(info.offset, { x: 0, y: 0 }) >= 3

        if (!panStarted && !distancePastThreshold) return

        const { point } = info
        const { timestamp } = getFrameData()
        session.current.pointHistory.push({ ...point, timestamp })

        if (!panStarted) {
            onPanStart && onPanStart(lastMoveEvent.current, info)
            session.current.startEvent = lastMoveEvent.current
        }

        onPan && onPan(lastMoveEvent.current, info)
    }

    function onPointerMove(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: EventInfo
    ) {
        lastMoveEvent.current = event
        lastMoveEventInfo.current = transformPoint(info)

        // Because Safari doesn't trigger mouseup events when it's above a `<select>`
        if (isMouseEvent(event) && event.buttons === 0) {
            onPointerUp(event, info)
            return
        }

        // Throttle mouse move event to once per frame
        sync.update(updatePoint, true)
    }

    function onPointerUp(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: EventInfo
    ) {
        cancelPan()

        if (!session.current) {
            warning(false, "onPointerUp fired without pointer session")
            return
        }

        onPanEnd && onPanEnd(event, getPanInfo(transformPoint(info)))

        session.current = null
    }

    function onPointerDown(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: EventInfo
    ) {
        // If we have more than one touch, don't start detecting this gesture
        if (isTouchEvent(event) && event.touches.length > 1) return

        const initialInfo = transformPoint(info)
        const { point } = initialInfo

        const { timestamp } = getFrameData()
        session.current = {
            target: event.target,
            pointHistory: [{ ...point, timestamp }],
        }

        onPanSessionStart && onPanSessionStart(event, getPanInfo(initialInfo))

        removePointerEvents()
        const removeOnPointerMove = addPointerEvent(
            window,
            "pointermove",
            onPointerMove
        )
        const removeOnPointerUp = addPointerEvent(
            window,
            "pointerup",
            onPointerUp
        )

        pointerEventSubscription.current = () => {
            removeOnPointerMove && removeOnPointerMove()
            removeOnPointerUp && removeOnPointerUp()
        }
    }

    usePointerEvent(ref, "pointerdown", hasPanEvents && onPointerDown)
    useUnmountEffect(cancelPan)
}
