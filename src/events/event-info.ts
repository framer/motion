import { EventInfo, Point, EventHandler } from "./types"

interface EventLike {
    pageX: number
    pageY: number
    target: EventTarget | null
}

// A limitation of JSDom is the inability to create custom MouseEvents with our own
// `pageX` and `pageY` properties. So we create this default pointer, and expose it internally.
// To test mouse movement, import and update _DANGER_TEST_POINTER and then trigger mouseMove.
export const _TEST_POINTER_DO_NOT_USE = { x: 0, y: 0 }

const getScale = (
    target: HTMLElement,
    rect: ClientRect | DOMRect,
    axis: "width" | "height"
) => {
    const measured = target.style[axis]
    if (measured && measured !== "") {
        return parseFloat(measured) / rect[axis]
    }

    return 1
}

const pointForTarget = (
    {
        pageX = _TEST_POINTER_DO_NOT_USE.x,
        pageY = _TEST_POINTER_DO_NOT_USE.y,
    }: EventLike,
    target: HTMLElement | null
): Point => {
    if (!target) {
        return { x: pageX, y: pageY }
    }
    // Safari
    if (window.webkitConvertPointFromPageToNode) {
        let webkitPoint = new WebKitPoint(pageX, pageY)
        webkitPoint = window.webkitConvertPointFromPageToNode(
            target,
            webkitPoint
        )
        return { x: webkitPoint.x, y: webkitPoint.y }
    }

    // All other browsers
    // TODO: This does not work with rotate yet
    const rect = target.getBoundingClientRect()
    const scaleX = getScale(target, rect, "width")
    const scaleY = getScale(target, rect, "height")

    const point = {
        x: scaleX * (pageX - rect.left - target.clientLeft + target.scrollLeft),
        y: scaleY * (pageY - rect.top - target.clientTop + target.scrollTop),
    }

    return point
}

const extractEventInfo = (event: EventLike): EventInfo => {
    const target = event.target instanceof HTMLElement ? event.target : null
    const point = pointForTarget(event, target)
    const devicePoint = pointForTarget(event, document.body)
    return { point, devicePoint }
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
    return listener
}
