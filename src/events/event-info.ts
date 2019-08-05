import { EventInfo } from "./types"
import { isTouchEvent } from "../gestures/utils/event-type"

/**
 * Filters out events not attached to the primary pointer (currently left mouse button)
 * @param eventHandler
 */
function filterPrimaryPointer(eventHandler?: EventListener) {
    if (!eventHandler) return undefined

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

function pointFromTouch(e: TouchEvent) {
    const primaryTouch = e.touches[0] || e.changedTouches[0]
    const { pageX, pageY } = primaryTouch || defaultPagePoint

    return { x: pageX, y: pageY }
}

function pointFromMouse({ pageX = 0, pageY = 0 }: MouseEvent | PointerEvent) {
    return { x: pageX, y: pageY }
}

function extractEventInfo(
    event: MouseEvent | TouchEvent | PointerEvent
): EventInfo {
    return {
        point: isTouchEvent(event)
            ? pointFromTouch(event)
            : pointFromMouse(event),
    }
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
