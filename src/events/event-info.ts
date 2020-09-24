import { EventInfo } from "./types"
import { isTouchEvent } from "../gestures/utils/event-type"

/**
 * Filters out events not attached to the primary pointer (currently left mouse button)
 * @param eventHandler
 */
function filterPrimaryPointer(eventHandler: EventListener): EventListener {
    return (event: Event) => {
        const isMouseEvent = event instanceof MouseEvent
        const isPrimaryPointer =
            !isMouseEvent ||
            (isMouseEvent && (event as MouseEvent).button === 0)

        if (isPrimaryPointer) {
            eventHandler(event)
        }
    }
}

export type EventListenerWithPointInfo = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: EventInfo
) => void

const defaultPagePoint = { pageX: 0, pageY: 0 }

function pointFromTouch(e: TouchEvent, pointType: "page" | "client" = "page") {
    const primaryTouch = e.touches[0] || e.changedTouches[0]
    const point = primaryTouch || defaultPagePoint

    return {
        x: point[pointType + "X"],
        y: point[pointType + "Y"],
    }
}

function pointFromMouse(
    point: MouseEvent | PointerEvent,
    pointType: "page" | "client" = "page"
) {
    return {
        x: point[pointType + "X"],
        y: point[pointType + "Y"],
    }
}

export function extractEventInfo(
    event: MouseEvent | TouchEvent | PointerEvent,
    pointType: "page" | "client" = "page"
): EventInfo {
    return {
        point: isTouchEvent(event)
            ? pointFromTouch(event, pointType)
            : pointFromMouse(event, pointType),
    }
}

export function getViewportPointFromEvent(
    event: MouseEvent | TouchEvent | PointerEvent
) {
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
