import { EventInfo, EventHandler } from "./types"

interface EventLike {
    pageX: number
    pageY: number
    target: EventTarget | null
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
    handler?: EventListenerWithPointInfo
): EventListener | undefined => {
    if (!handler) {
        return undefined
    }

    const listener: EventListener = (event: any, info?: EventInfo) => {
        if (!info) {
            info = extractEventInfo(event)
        }
        handler(event, info)
    }

    return listener
}
