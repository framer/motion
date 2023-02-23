import { ResizeHandler } from "./types"

const windowCallbacks = new Set<ResizeHandler<Window>>()

let windowResizeHandler: VoidFunction | undefined

function createWindowResizeHandler() {
    windowResizeHandler = () => {
        const size = {
            width: window.innerWidth,
            height: window.innerHeight,
        }

        const info = {
            target: window,
            size,
            contentSize: size,
        }

        windowCallbacks.forEach((callback) => callback(info))
    }

    window.addEventListener("resize", windowResizeHandler)
}

export function resizeWindow(callback: ResizeHandler<Window>) {
    windowCallbacks.add(callback)

    if (!windowResizeHandler) createWindowResizeHandler()

    return () => {
        windowCallbacks.delete(callback)

        if (!windowCallbacks.size && windowResizeHandler) {
            windowResizeHandler = undefined
        }
    }
}
