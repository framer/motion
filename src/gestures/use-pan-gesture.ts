import { RefObject, useMemo, useEffect, useRef, useContext } from "react"
import {
    EventInfo,
    usePointerEvents,
    Point,
    EventHandler,
    useConditionalPointerEvents,
} from "../events"
import { motionValue, MotionValue } from "../value"
import sync, { cancelSync, getFrameData } from "framesync"
import { MotionPluginContext } from "../motion/context/MotionPluginContext"
import { safeWindow } from "../events/utils/window"

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
            timeDelta * 1000
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
 * @remarks
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
export interface PanInfo {
    /**
     * Contains `x` and `y` values for the current pan position relative
     * to the device or page.
     *
     * @remarks
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
     * @remarks
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
     * @remarks
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
     * @remarks
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
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link PanInfo} object containing `x` and `y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPan?(event: MouseEvent | TouchEvent, info: PanInfo): void

    /**
     * Callback function that fires when the pan gesture begins on this element.
     *
     * ```jsx
     * function onPanStart(event, info) {
     *   console.log(info.point.x, spoint.y)
     * }
     *
     * <motion.div onPanStart={onPanStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanStart?(event: MouseEvent | TouchEvent, info: PanInfo): void

    /**
     * Callback function that fires when the pan gesture ends on this element.
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
     * @param info - An {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanEnd?(event: MouseEvent | TouchEvent, info: PanInfo): void
}

type MotionXY = { x: MotionValue<number>; y: MotionValue<number> }

/**
 *
 * @param handlers
 * @param ref
 * @internal
 */
export function usePanGesture(
    handlers: PanHandlers,
    ref: RefObject<Element>
): undefined
export function usePanGesture(
    handlers: PanHandlers
): { onPointerDown: EventHandler }
export function usePanGesture(
    { onPan, onPanStart, onPanEnd }: PanHandlers,
    ref?: RefObject<Element>
) {
    let session: null | EventSession = null
    const pointer = useRef<MotionXY | null>(null)
    const lastMoveEvent = useRef<MouseEvent | TouchEvent | null>(null)
    const lastMoveEventInfo = useRef<EventInfo | null>(null)
    const { transformPagePoint } = useContext(MotionPluginContext)

    const updatePoint = useMemo(
        () => () => {
            if (
                !session ||
                pointer.current === null ||
                lastMoveEventInfo.current === null ||
                lastMoveEvent.current === null
            ) {
                // tslint:disable-next-line:no-console
                console.error("Pointer move without started session")
                return
            }
            const { point } = lastMoveEventInfo.current
            const delta = Point.subtract(point, lastDevicePoint(session))
            const offset = Point.subtract(point, startDevicePoint(session))
            const { timestamp } = getFrameData()
            session.pointHistory.push({ ...point, timestamp })
            pointer.current.x.set(point.x)
            pointer.current.y.set(point.y)

            if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
                const velocity = getVelocity(session, 0.1)

                const info = {
                    point,
                    delta,
                    offset,
                    velocity,
                }

                if (session.startEvent) {
                    if (onPan) {
                        onPan(lastMoveEvent.current, info)
                    }
                } else {
                    if (onPanStart) {
                        onPanStart(lastMoveEvent.current, info)
                    }
                    session.startEvent = lastMoveEvent.current
                }
            }

            // Reset delta
            delta.x = 0
            delta.y = 0
        },
        [onPan, onPanStart]
    )

    const onPointerMove = useMemo(
        () => (event: MouseEvent | TouchEvent, info: EventInfo) => {
            lastMoveEvent.current = event

            if (transformPagePoint) {
                lastMoveEventInfo.current = {
                    point: transformPagePoint(info.point),
                }
            } else {
                lastMoveEventInfo.current = info
            }

            // Throttle mouse move event to once per frame
            sync.update(updatePoint, true)
        },
        [onPan, onPanStart]
    )

    const onPointerUp = useMemo(
        () => (event: MouseEvent | TouchEvent, { point }: EventInfo) => {
            cancelSync.update(updatePoint)

            if (!session || pointer.current === null) {
                // tslint:disable-next-line:no-console
                console.error("Pointer end without started session")
                return
            }

            const delta = Point.subtract(point, lastDevicePoint(session))
            const offset = Point.subtract(point, startDevicePoint(session))
            const velocity = getVelocity(session, 0.1)

            stopPointerMove()
            stopPointerUp()

            if (onPanEnd) {
                onPanEnd(event, {
                    point,
                    delta,
                    offset,
                    velocity,
                })
            }
            session = null
        },
        [onPanEnd, onPointerMove]
    )

    const [startPointerUp, stopPointerUp] = usePointerEvents(
        { onPointerUp },
        safeWindow
    )
    const [startPointerMove, stopPointerMove] = usePointerEvents(
        { onPointerMove },
        safeWindow,
        { capture: true }
    )
    const onPointerDown = useMemo(
        () => {
            return (event: Event, { point }: EventInfo) => {
                const initialPoint = transformPagePoint
                    ? transformPagePoint(point)
                    : point

                pointer.current = {
                    x: motionValue(initialPoint.x),
                    y: motionValue(initialPoint.y),
                }

                const { timestamp } = getFrameData()
                session = {
                    target: event.target,
                    pointHistory: [{ ...initialPoint, timestamp }],
                }

                startPointerMove()
                startPointerUp()
            }
        },
        [onPointerUp, onPointerMove]
    )

    useEffect(() => {
        return () => {
            stopPointerMove()
            stopPointerUp()
        }
    }, [])
    let handlers: Partial<{ onPointerDown: EventHandler }> = { onPointerDown }
    if (!onPan && !onPanStart && !onPanEnd) {
        handlers = {}
    }

    return useConditionalPointerEvents(handlers, ref)
}
