import { RefObject } from "react"
import { useDomEvent, addDomEvent } from "./use-dom-event"
import { wrapHandler, EventListenerWithPointInfo } from "./event-info"

export function addPointerEvent(
    target: EventTarget,
    eventName: string,
    handler: EventListenerWithPointInfo,
    options?: AddEventListenerOptions
) {
    return addDomEvent(
        target,
        eventName,
        wrapHandler(handler, eventName === "pointerdown"),
        options
    )
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
        handler && wrapHandler(handler, eventName === "pointerdown"),
        options
    )
}
