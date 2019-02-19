export interface ServerSafeWindow extends EventTarget {
    onpointerdown: false
    onpointermove: false
    onpointerup: false
    ontouchstart: false
    ontouchmove: false
    ontouchend: false
    onmousedown: false
    onmousemove: false
    onmouseup: false
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
}

/**
 * Creates a server-safe reference to `window`, returning a mock if none is available.
 *
 * @internal
 */
export const safeWindow = typeof window === "undefined" ? mockWindow : window
