import { RefObject } from "react"
import { useEvent } from "./use-event"

export interface EventLike {
    pageX: number
    pageY: number
    target: EventTarget | null
}

const pointForTarget = (event: EventLike, target: Node | null): Point => {
    if (!target) {
        return { x: event.pageX, y: event.pageY }
    }
    let webkitPoint = new WebKitPoint(event.pageX, event.pageY)
    webkitPoint = window.webkitConvertPointFromPageToNode(target, webkitPoint)
    return { x: webkitPoint.x, y: webkitPoint.y }
}

const extractEventInfo = (event: EventLike): EventInfo => {
    const target = event.target instanceof Node ? event.target : null
    const point = pointForTarget(event, target)
    const devicePoint = pointForTarget(event, document.body)
    return { point, devicePoint }
}

interface Point {
    x: number
    y: number
}

interface EventInfo {
    point: Point
    devicePoint: Point
}

export type EventHandler = (info: EventInfo, event: Event) => void

const wrapHandler = (handler?: EventHandler): EventListener | undefined => {
    if (!handler) {
        return undefined
    }
    const listener = (event: any) => {
        const info = extractEventInfo(event)
        handler(info, event)
    }
    return listener
}

const destructuringMap = (
    ...values: ([() => void, () => void] | undefined)[]
): [() => void, () => void] | undefined => {
    if (values.every(v => v === undefined)) {
        return
    }
    const start = () => {
        for (const value of values) {
            if (value) {
                value[0]()
            }
        }
    }
    const stop = () => {
        for (const value of values) {
            if (value) {
                value[1]()
            }
        }
    }
    return [start, stop]
}

export const useMouseEvents = (
    { onMouseDown, onMouseMove, onMouseUp }: { [key: string]: EventHandler },
    ref: RefObject<EventTarget> | EventTarget,
    options?: AddEventListenerOptions
): [() => void, () => void] | undefined => {
    const down = useEvent("mousedown", ref, wrapHandler(onMouseDown), options)
    const move = useEvent("mousemove", ref, wrapHandler(onMouseMove), options)
    const up = useEvent("mouseup", ref, wrapHandler(onMouseUp), options)
    return destructuringMap(down, move, up)
}

export const useTouchEvents = (
    { onTouchStart, onTouchMove, onTouchEnd }: { [key: string]: EventHandler },
    ref: RefObject<EventTarget> | EventTarget,
    options?: AddEventListenerOptions
) => {
    const down = useEvent("touchstart", ref, wrapHandler(onTouchStart), options)
    const move = useEvent("touchmove", ref, wrapHandler(onTouchMove), options)
    const up = useEvent("touchend", ref, wrapHandler(onTouchEnd), options)
    return destructuringMap(down, move, up)
}

export const useNativePointerEvents = (
    { onPointerDown, onPointerMove, onPointerUp }: { [key: string]: EventHandler },
    ref: RefObject<EventTarget> | EventTarget,
    options?: AddEventListenerOptions
) => {
    const down = useEvent("pointerdown", ref, wrapHandler(onPointerDown), options)
    const move = useEvent("pointermove", ref, wrapHandler(onPointerMove), options)
    const up = useEvent("pointerup", ref, wrapHandler(onPointerUp), options)
    return destructuringMap(down, move, up)
}

const supportsPointerEvents =
    window.onpointerdown === null && window.onpointermove === null && window.onpointerup === null
const supportsTouchEvents = window.ontouchstart === null && window.ontouchmove === null && window.ontouchend === null
const supportsMouseEvents = window.onmousedown === null && window.onmousemove === null && window.onmouseup === null

export const usePointerEvents = (
    { onPointerDown, onPointerMove, onPointerUp }: { [key: string]: EventHandler },
    ref: RefObject<EventTarget> | EventTarget,
    options?: AddEventListenerOptions
) => {
    let mouseEvents = {},
        touchEvents = {},
        pointerEvents = {}
    if (supportsPointerEvents) {
        pointerEvents = { onPointerDown, onPointerMove, onPointerUp }
    } else if (supportsTouchEvents) {
        touchEvents = { onTouchStart: onPointerDown, onTouchMove: onPointerMove, onTouchEnd: onPointerUp }
    } else if (supportsMouseEvents) {
        mouseEvents = { onMouseDown: onPointerDown, onMouseMove: onPointerMove, onMouseUp: onPointerUp }
    }
    const pointer = useNativePointerEvents(pointerEvents, ref, options)
    const touch = useTouchEvents(touchEvents, ref, options)
    const mouse = useMouseEvents(mouseEvents, ref, options)
    return destructuringMap(pointer, touch, mouse) || []
}
