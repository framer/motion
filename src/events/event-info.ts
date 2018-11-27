import { EventInfo, Point, EventHandler } from "./types"

interface EventLike {
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
