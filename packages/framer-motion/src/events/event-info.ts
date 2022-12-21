import { EventInfo } from "./types"

/**
 * Filters out events not attached to the primary pointer (currently left mouse button)
 * @param eventHandler
 */
function filterPrimaryPointer(eventHandler: EventListener): EventListener {
    return (event: PointerEvent) => {
        if (event.isPrimary) {
            eventHandler(event)
        }
    }
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
    handler: EventListenerWithPointInfo,
    shouldFilterPrimaryPointer = false
): EventListener => {
    const listener: EventListener = (event: any) =>
        handler(event, extractEventInfo(event))

    return shouldFilterPrimaryPointer
        ? filterPrimaryPointer(listener)
        : listener
}
