import { RefObject, useMemo } from "react"
import { EventHandler, usePointerEvents } from "./use-mouse-events"

export const usePanGesture = (
    { onPan, onPanStart, onPanEnd }: { [key: string]: Function },
    ref: RefObject<Element>
) => {
    let session: null | any = null
    const onPointerMove = useMemo(
        () => {
            return ({ point, devicePoint }, event) => {
                if (!session || !session.target) {
                    console.error("Mouse move with started session")
                    return
                }

                // const deviceElement = device && device.current ? device.current : document.body
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
        // [device.current, onPan, onPanStart]
    )
    const onPointerUp = useMemo(
        () => {
            return ({ point, devicePoint }, event) => {
                stopPointerMove()
                stopPointerUp()
                if (onPanEnd) {
                    onPanEnd(event)
                }
                session = null
                // console.log("mouseUp");
            }
        },
        [onPanEnd, onPointerMove]
    )

    const [startPointerUp, stopPointerUp] = usePointerEvents({ onPointerUp }, window)
    const [startPointerMove, stopPointerMove] = usePointerEvents({ onPointerMove }, window, { capture: true })
    const onPointerDown = useMemo(
        () => {
            return ({ point, devicePoint }, event) => {
                // const deviceElement = device && device.current ? device.current : document.body
                session = {
                    target: event.target,
                    lastDevicePoint: devicePoint,
                }
                startPointerMove()
                startPointerUp()
            }
        },
        // [device.current, onPointerUp, onPointerMove]
        [onPointerUp, onPointerMove]
    )

    usePointerEvents({ onPointerDown }, ref)

    // TODO
    const handlers = {}

    return handlers
}
