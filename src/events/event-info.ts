import { EventInfo } from "./types"

interface EventLike {
    pageX: number
    pageY: number
    target: EventTarget | null
}
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

const extractEventInfo = ({ pageX = 0, pageY = 0 }: EventLike): EventInfo => {
    return {
        point: { x: pageX, y: pageY },
    }
}

export const wrapHandler = (
    handler?: EventListenerWithPointInfo,
    shouldFilterPrimaryPointer = false
): EventListener | undefined => {
    if (!handler) {
        return undefined
    }

    const listener = (event: any, info?: EventInfo) => {
        if (!info) {
            info = extractEventInfo(event)
        }
        handler(event, info)
    }

    return shouldFilterPrimaryPointer
        ? filterPrimaryPointer(listener)
        : listener
}
