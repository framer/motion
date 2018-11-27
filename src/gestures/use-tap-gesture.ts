import { RefObject, useEffect, useMemo } from "react"
import { usePointerEvents, EventInfo, Point } from "../events"
import { start } from "repl"

interface TapInfo {
    point: Point
    devicePoint: Point
}

interface TapSession {
    target: EventTarget | null
}

type TapHandler = (session: TapInfo, event: Event) => void

interface TapHandlers {
    onTap: TapHandler
}

export const useTapGesture = ({ onTap }: TapHandlers, ref: RefObject<Element>) => {
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
                if (event.target !== ref.current) {
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
    const [startPointerUp, stopPointerUp] = usePointerEvents({ onPointerUp }, window)

    const onPointerDown = useMemo(
        () => (event: Event) => {
            console.log("pointerdown")
            startPointerUp()
            if (event.target !== ref.current) return
            session = {
                target: event.target,
            }
        },
        [startPointerUp, session]
    )
    usePointerEvents({ onPointerDown }, ref)
    useEffect(
        () => {
            return () => {
                stopPointerUp()
            }
        },
        [ref.current, onPointerUp]
    )
}
