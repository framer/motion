import { RefObject, useEffect, useMemo } from "react"
import { usePointerEvents, EventInfo, Point } from "../events"
import { EventHandler } from "../events/types"

interface TapInfo {
    point: Point
    devicePoint: Point
}

interface TapSession {
    target: EventTarget | null
}

type TapHandler = (session: TapInfo, event: Event) => void

export interface TapHandlers {
    onTap?: TapHandler
}

export function useTapGesture(handlers: TapHandlers): { onPointerDown: EventHandler }
export function useTapGesture(handlers: TapHandlers, ref: RefObject<Element>): undefined
export function useTapGesture(
    { onTap }: TapHandlers,
    ref?: RefObject<Element>
): undefined | { onPointerDown: EventHandler } {
    // // console.log("tap gesture");
    // const device = useContext(DeviceContext);
    // // console.log("mouseMove");
    // const dragging = useContext(DragContext);
    // console.log("useTapGesture", dragging);
    let session: TapSession | null = null
    const onPointerUp = useMemo(
        () => {
            return (event: Event, { point, devicePoint }: EventInfo) => {
                if (!session) {
                    return
                }
                if (!ref || event.target !== ref.current) {
                    return
                }
                //   const deviceElement =
                //     device && device.current ? device.current : document.body;
                //   const point = pointForEvent(event, event.target);
                //   const devicePoint = pointForEvent(event, deviceElement);

                if (onTap) {
                    onTap({ point, devicePoint }, event)
                }
                session = null
            }
        },
        [onTap]
        //   [onTap, dragging, device.current]
    )

    const onPointerDown = (event: Event) => {
        startPointerUp()
        if (!ref || event.target !== ref.current) return
        session = {
            target: event.target,
        }
    }
    const [startPointerUp, stopPointerUp] = usePointerEvents({ onPointerUp }, window)
    useEffect(
        () => {
            return () => {
                stopPointerUp()
            }
        },
        [ref && ref.current, onPointerUp]
    )
    const handlers = { onPointerDown }
    if (!ref) {
        return handlers
    }
    usePointerEvents(handlers, ref)
}
