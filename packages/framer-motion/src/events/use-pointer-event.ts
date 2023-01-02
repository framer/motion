import { RefObject } from "react"
import { useDomEvent, addDomEvent } from "./use-dom-event"
import { addPointerInfo, EventListenerWithPointInfo } from "./event-info"

export function addPointerEvent(
    target: EventTarget,
    eventName: string,
    handler: EventListenerWithPointInfo,
    options?: AddEventListenerOptions
) {
    return addDomEvent(target, eventName, addPointerInfo(handler), options)
}

export function usePointerEvent(
    ref: RefObject<Element>,
    eventName: string,
    handler?: EventListenerWithPointInfo | undefined,
    options?: AddEventListenerOptions
) {
    return useDomEvent(
        ref,
        eventName,
        handler && addPointerInfo(handler),
        options
    )
}
