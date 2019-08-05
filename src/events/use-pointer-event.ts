import { RefObject } from "react"
import { useDomEvent, addEventListener } from "./use-dom-event"
import { wrapHandler, EventListenerWithPointInfo } from "./event-info"

// We check for event support via functions in case they've been mocked by a testing suite.
const isBrowser = typeof window !== "undefined"
const supportsPointerEvents = () => isBrowser && window.onpointerdown === null
const supportsTouchEvents = () => isBrowser && window.ontouchstart === null
const supportsMouseEvents = () => isBrowser && window.onmousedown === null

interface PointerNameMap {
    pointerdown: string
    pointermove: string
    pointerup: string
    pointercancel: string
    pointerover?: string
    pointerout?: string
    pointerenter?: string
    pointerleave?: string
}

const mouseEventNames: PointerNameMap = {
    pointerdown: "mousedown",
    pointermove: "mousemove",
    pointerup: "mouseup",
    pointercancel: "mousecancel",
    pointerover: "mouseover",
    pointerout: "mouseout",
    pointerenter: "mouseenter",
    pointerleave: "mouseleave",
}

const touchEventNames: PointerNameMap = {
    pointerdown: "touchstart",
    pointermove: "touchmove",
    pointerup: "touchend",
    pointercancel: "touchcancel",
}

function getPointerEventName(name: string): string {
    if (supportsPointerEvents()) {
        return name
    } else if (supportsTouchEvents()) {
        return touchEventNames[name]
    } else if (supportsMouseEvents()) {
        return mouseEventNames[name]
    }

    return name
}

export function addPointerEvent(
    target: EventTarget,
    eventName: string,
    handler?: EventListenerWithPointInfo | undefined,
    options?: AddEventListenerOptions
) {
    return addEventListener(
        target,
        getPointerEventName(eventName),
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
        getPointerEventName(eventName),
        wrapHandler(handler, eventName === "pointerdown"),
        options
    )
}
