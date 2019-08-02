import { RefObject } from "react"
import { useDomEvent, addEventListener } from "./use-dom-event"
import { wrapHandler, EventListenerWithPointInfo } from "./event-info"

export function addPointerEvent(
    target: Element | Document,
    eventName: string,
    handler?: EventListenerWithPointInfo | undefined,
    options?: AddEventListenerOptions
) {
    // TODO clever mapping of pointer names
    return addEventListener(target, eventName, wrapHandler(handler), options)
}

export function usePointerEvent(
    ref: RefObject<Element>,
    eventName: string,
    handler?: EventListenerWithPointInfo | undefined,
    options?: AddEventListenerOptions
) {
    // TODO clever mapping of pointer names
    return useDomEvent(ref, eventName, wrapHandler(handler), options)
}
