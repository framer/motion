import { sync } from "../../../frameloop"
import { ResizeHandler } from "./types"

const windowCallbacks = new Set<ResizeHandler<Window>>()

let handlerIsAttached = false

function updateResizeCallback() {
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

function windowResizeHandler() {
    sync.read(updateResizeCallback)
}

function attachWindowResizeHandler() {
    handlerIsAttached = true
    window.addEventListener("resize", windowResizeHandler)
}

function removeWindowResizeHandler() {
    if (!handlerIsAttached) return

    window.removeEventListener("resize", windowResizeHandler)

    handlerIsAttached = false
}

export function resizeWindow(callback: ResizeHandler<Window>) {
    windowCallbacks.add(callback)

    if (!handlerIsAttached) attachWindowResizeHandler()

    return () => {
        windowCallbacks.delete(callback)

        if (!windowCallbacks.size) {
            removeWindowResizeHandler()
        }
    }
}
