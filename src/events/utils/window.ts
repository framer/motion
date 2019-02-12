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

export const safeWindow = typeof window === "undefined" ? mockWindow : window
