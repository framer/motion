import { EventInfo } from "./types"
import { isPrimaryPointer } from "./utils/is-primary-pointer"

export type EventListenerWithPointInfo = (
    e: PointerEvent,
    info: EventInfo
) => void

export function extractEventInfo(
    event: PointerEvent,
    pointType: "page" | "client" = "page"
): EventInfo {
    return {
        point: {
            x: event[pointType + "X"],
            y: event[pointType + "Y"],
        },
    }
}

export function getViewportPointFromEvent(event: PointerEvent) {
    return extractEventInfo(event, "client")
}

export const wrapHandler = (
    handler: EventListenerWithPointInfo
): EventListener => {
    return (event: PointerEvent) =>
        isPrimaryPointer(event) && handler(event, extractEventInfo(event))
}
