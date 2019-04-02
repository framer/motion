import { EventInfo, EventHandler } from "./types"

interface EventLike {
    pageX: number
    pageY: number
    target: EventTarget | null
}

const extractEventInfo = ({ pageX = 0, pageY = 0 }: EventLike): EventInfo => {
    return {
        point: { x: pageX, y: pageY },
    }
}

export const wrapHandler = (
    handler?: EventHandler
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
    if (handler.renderId) listener.renderId = handler.renderId
    return listener
}
