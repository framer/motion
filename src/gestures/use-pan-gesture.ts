import { RefObject, useMemo, useEffect, useRef } from "react"
import { EventInfo, usePointerEvents, Point, EventHandler, useConditionalPointerEvents } from "../events"
import { motionValue, MotionValue } from "value"

interface EventSession {
    lastDevicePoint: Point
    startEvent?: Event
    target: EventTarget | null
    startDevicePoint: Point
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

const getVelocity = ({ x, y }: MotionXY): Point => ({
    x: x.getVelocity(),
    y: y.getVelocity(),
})

export function usePanGesture(handlers: PanHandlers, ref: RefObject<Element>): undefined
export function usePanGesture(handlers: PanHandlers): { onPointerDown: EventHandler }
export function usePanGesture({ onPan, onPanStart, onPanEnd }: PanHandlers, ref?: RefObject<Element>) {
    let session: null | EventSession = null
    const pointer = useRef<MotionXY | null>(null)

    const onPointerMove = useMemo(
        () => {
            return (event: Event, { point, devicePoint }: EventInfo) => {
                if (!session || pointer.current === null) {
                    // tslint:disable-next-line:no-console
                    console.error("Pointer move without started session")
                    return
                }

                const delta = Point.subtract(devicePoint, session.lastDevicePoint)
                const offset = Point.subtract(devicePoint, session.startDevicePoint)

                pointer.current.x.set(point.x)
                pointer.current.y.set(point.y)

                if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
                    if (session.startEvent) {
                        if (onPan) {
                            onPan(event, { point, devicePoint, delta, offset, velocity: getVelocity(pointer.current) })
                        }
                    } else {
                        if (onPanStart) {
                            onPanStart(event, {
                                point,
                                devicePoint,
                                delta,
                                offset,
                                velocity: getVelocity(pointer.current),
                            })
                        }
                        session.startEvent = event
                    }
                }
                session.lastDevicePoint = devicePoint
            }
        },
        [onPan, onPanStart]
    )
    const onPointerUp = useMemo(
        () => {
            return (event: Event, { point, devicePoint }: EventInfo) => {
                if (!session || pointer.current === null) {
                    // tslint:disable-next-line:no-console
                    console.error("Pointer end without started session")
                    return
                }
                const delta = Point.subtract(devicePoint, session.lastDevicePoint)
                const offset = Point.subtract(devicePoint, session.startDevicePoint)
                stopPointerMove()
                stopPointerUp()
                if (onPanEnd) {
                    onPanEnd(event, { point, devicePoint, delta, offset, velocity: getVelocity(pointer.current) })
                }
                session = null
            }
        },
        [onPanEnd, onPointerMove]
    )
    const [startPointerUp, stopPointerUp] = usePointerEvents({ onPointerUp }, window)
    const [startPointerMove, stopPointerMove] = usePointerEvents({ onPointerMove }, window, { capture: true })
    const onPointerDown = useMemo(
        () => {
            return (event: Event, { devicePoint, point }: EventInfo) => {
                pointer.current = {
                    x: motionValue(point.x),
                    y: motionValue(point.y),
                }

                session = {
                    target: event.target,
                    lastDevicePoint: devicePoint,
                    startDevicePoint: devicePoint,
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
    })

    return useConditionalPointerEvents({ onPointerDown }, ref)
}
