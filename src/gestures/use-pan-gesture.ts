import { RefObject, useMemo, useEffect, useRef } from "react"
import {
    EventInfo,
    usePointerEvents,
    Point,
    EventHandler,
    useConditionalPointerEvents,
} from "../events"
import { motionValue, MotionValue } from "../value"
import sync, { cancelSync, getFrameData } from "framesync"

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

export interface PanInfo {
    point: Point
    devicePoint: Point
    delta: Point
    offset: Point
    velocity: Point
}

export type PanHandler = (event: Event, info: PanInfo) => void

export interface PanHandlers {
    onPan?: PanHandler
    onPanStart?: PanHandler
    onPanEnd?: PanHandler
}

type MotionXY = { x: MotionValue<number>; y: MotionValue<number> }

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
    const lastMoveEvent = useRef<Event | null>(null)
    const lastMoveEventInfo = useRef<EventInfo | null>(null)

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
            const { point, devicePoint } = lastMoveEventInfo.current
            const delta = Point.subtract(devicePoint, lastDevicePoint(session))
            const offset = Point.subtract(
                devicePoint,
                startDevicePoint(session)
            )
            const { timestamp } = getFrameData()
            session.pointHistory.push({ ...devicePoint, timestamp })
            pointer.current.x.set(devicePoint.x)
            pointer.current.y.set(devicePoint.y)

            if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
                const velocity = getVelocity(session, 0.1)

                const info = {
                    point,
                    devicePoint,
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
        () => (event: Event, info: EventInfo) => {
            lastMoveEvent.current = event
            lastMoveEventInfo.current = info

            // Throttle mouse move event to once per frame
            sync.update(updatePoint, true)
        },
        [onPan, onPanStart]
    )

    const onPointerUp = useMemo(
        () => (event: Event, { point, devicePoint }: EventInfo) => {
            cancelSync.update(updatePoint)

            if (!session || pointer.current === null) {
                // tslint:disable-next-line:no-console
                console.error("Pointer end without started session")
                return
            }

            const delta = Point.subtract(devicePoint, lastDevicePoint(session))
            const offset = Point.subtract(
                devicePoint,
                startDevicePoint(session)
            )
            const velocity = getVelocity(session, 0.1)

            stopPointerMove()
            stopPointerUp()
            if (onPanEnd) {
                onPanEnd(event, {
                    point,
                    devicePoint,
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
        window
    )
    const [startPointerMove, stopPointerMove] = usePointerEvents(
        { onPointerMove },
        window,
        { capture: true }
    )
    const onPointerDown = useMemo(
        () => {
            return (event: Event, { devicePoint, point }: EventInfo) => {
                pointer.current = {
                    x: motionValue(point.x),
                    y: motionValue(point.y),
                }

                const { timestamp } = getFrameData()
                session = {
                    target: event.target,
                    pointHistory: [{ ...devicePoint, timestamp }],
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
