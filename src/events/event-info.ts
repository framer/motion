import { EventInfo, Point, EventHandler } from "./types"

interface EventLike {
    pageX: number
    pageY: number
    target: EventTarget | null
}

const pointForTarget = (event: EventLike, target: HTMLElement | null): Point => {
    if (!target) {
        return { x: event.pageX, y: event.pageY }
    }
    // Safari
    if (window.webkitConvertPointFromPageToNode) {
        let webkitPoint = new WebKitPoint(event.pageX, event.pageY)
        webkitPoint = window.webkitConvertPointFromPageToNode(target, webkitPoint)
        return { x: webkitPoint.x, y: webkitPoint.y }
    }
    // All other browsers
    // TODO: This does not work with rotate yet
    const rect = target.getBoundingClientRect()
    let scaleX = 1
    if (target.style.width && target.style.width !== "") {
        scaleX = parseFloat(target.style.width) / rect.width
    }
    let scaleY = 1
    if (target.style.height && target.style.height !== "") {
        scaleY = parseFloat(target.style.height) / rect.height
    }
    const scale = {
        x: scaleX,
        y: scaleY,
    }
    const point = {
        x: scale.x * (event.pageX - rect.left - target.clientLeft + target.scrollLeft),
        y: scale.y * (event.pageY - rect.top - target.clientTop + target.scrollTop),
    }
    return point
}

const extractEventInfo = (event: EventLike): EventInfo => {
    const target = event.target instanceof HTMLElement ? event.target : null
    const point = pointForTarget(event, target)
    const devicePoint = pointForTarget(event, document.body)
    return { point, devicePoint }
}

export const wrapHandler = (handler?: EventHandler): EventListener | undefined => {
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
