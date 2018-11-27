import { RefObject, useMemo } from "react"
import { EventInfo, usePointerEvents, Point } from "../events"

interface EventSession {
    lastDevicePoint: Point
    startEvent?: Event
    target: EventTarget | null
}

interface PanInfo {
    point: Point
    devicePoint: Point
    delta: Point
}

export const usePanGesture = (
    { onPan, onPanStart, onPanEnd }: { [key: string]: (info: PanInfo, event: Event) => void },
    ref: RefObject<Element>
) => {
    let session: null | EventSession = null
    const onPointerMove = useMemo(
        () => {
            return (event: Event, { point, devicePoint }: EventInfo) => {
                if (!session) {
                    // tslint:disable-next-line:no-console
                    console.error("Pointer move without started session")
                    return
                }

                const delta = {
                    x: devicePoint.x - session.lastDevicePoint.x,
                    y: devicePoint.y - session.lastDevicePoint.y,
                }
                if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
                    if (session.startEvent) {
                        if (onPan) {
                            onPan({ point, devicePoint, delta }, event)
                        }
                    } else {
                        if (onPanStart) {
                            onPanStart({ point, devicePoint, delta }, event)
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
                const delta = {
                    x: devicePoint.x - session.lastDevicePoint.x,
                    y: devicePoint.y - session.lastDevicePoint.y,
                }
                stopPointerMove()
                stopPointerUp()
                if (onPanEnd) {
                    onPanEnd({ point, devicePoint, delta }, event)
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
                }
                startPointerMove()
                startPointerUp()
            }
        },
        [onPointerUp, onPointerMove]
    )

    usePointerEvents({ onPointerDown }, ref)

    // TODO
    const handlers = {}

    return handlers
}
