import { RefObject, useMemo, useEffect } from "react"
import { EventInfo, usePointerEvents, Point, EventHandler, useConditionalPointerEvents } from "../events"

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
}

export type PanHandler = (info: PanInfo, event: Event) => void

export interface PanHandlers {
    onPan?: PanHandler
    onPanStart?: PanHandler
    onPanEnd?: PanHandler
}

export function usePanGesture(handlers: PanHandlers, ref: RefObject<Element>): undefined
export function usePanGesture(handlers: PanHandlers): { onPointerDown: EventHandler }
export function usePanGesture({ onPan, onPanStart, onPanEnd }: PanHandlers, ref?: RefObject<Element>) {
    let session: null | EventSession = null
    const onPointerMove = useMemo(
        () => {
            return (event: Event, { point, devicePoint }: EventInfo) => {
                if (!session) {
                    // tslint:disable-next-line:no-console
                    console.error("Pointer move without started session")
                    return
                }

                const delta = Point.subtract(devicePoint, session.lastDevicePoint)
                const offset = Point.subtract(devicePoint, session.startDevicePoint)
                if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
                    if (session.startEvent) {
                        if (onPan) {
                            onPan({ point, devicePoint, delta, offset }, event)
                        }
                    } else {
                        if (onPanStart) {
                            onPanStart({ point, devicePoint, delta, offset }, event)
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
                if (!session) {
                    // tslint:disable-next-line:no-console
                    console.error("Pointer end without started session")
                    return
                }
                const delta = Point.subtract(devicePoint, session.lastDevicePoint)
                const offset = Point.subtract(devicePoint, session.startDevicePoint)
                stopPointerMove()
                stopPointerUp()
                if (onPanEnd) {
                    onPanEnd({ point, devicePoint, delta, offset }, event)
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
            return (event: Event, { devicePoint }: EventInfo) => {
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
