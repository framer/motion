export interface ServerSafeWindow extends EventTarget, WindowTimers {
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
    ): void
    onpointerdown: false
    onpointermove: false
    onpointerup: false
    ontouchstart: false
    ontouchmove: false
    ontouchend: false
    onmousedown: false
    onmousemove: false
    onmouseup: false
    scrollX: 0
    scrollY: 0
    devicePixelRatio: 1
    location: {
        href: ""
    }
    webkitConvertPointFromPageToNode(node: Node, pt: WebKitPoint): WebKitPoint
}

const mockWindow: ServerSafeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    onpointerdown: false,
    onpointermove: false,
    onpointerup: false,
    ontouchstart: false,
    ontouchmove: false,
    ontouchend: false,
    onmousedown: false,
    onmousemove: false,
    onmouseup: false,
    devicePixelRatio: 1,
    scrollX: 0,
    scrollY: 0,
    location: {
        href: "",
    },
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    setImmediate: () => 0,
    clearImmediate: () => {},
    webkitConvertPointFromPageToNode: (_: Node, pt: WebKitPoint) => pt,
}

/**
 * Creates a server-safe reference to `window`, returning a mock if none is available.
 *
 * @internal
 */
export const safeWindow = typeof window === "undefined" ? mockWindow : window
