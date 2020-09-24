import { isPrimaryPointer } from "../gestures/utils/event-type"
import { EventInfo } from "./types"

function filterPrimaryPointer(eventHandler?: EventListener) {
    if (!eventHandler) return

    return (event: PointerEvent) =>
        isPrimaryPointer(event) && eventHandler(event)
}

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
    handler?: EventListenerWithPointInfo,
    shouldFilterPrimaryPointer = false
): EventListener | undefined => {
    if (!handler) return

    const listener = (event: any) => handler(event, extractEventInfo(event))

    return shouldFilterPrimaryPointer
        ? filterPrimaryPointer(listener)
        : listener
}
