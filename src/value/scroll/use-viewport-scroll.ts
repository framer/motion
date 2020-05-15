import { useLayoutEffect } from "react"
import { createScrollMotionValues, createScrollUpdater } from "./utils"
import { addDomEvent } from "../../events/use-dom-event"

const viewportScrollValues = createScrollMotionValues()

function getViewportScrollOffsets() {
    return {
        xOffset: window.pageXOffset,
        yOffset: window.pageYOffset,
        xMaxOffset: document.body.clientWidth - window.innerWidth,
        yMaxOffset: document.body.clientHeight - window.innerHeight,
    }
}

let hasListeners = false

function addEventListeners() {
    hasListeners = true
    if (typeof window === "undefined") return

    const updateScrollValues = createScrollUpdater(
        viewportScrollValues,
        getViewportScrollOffsets
    )

    addDomEvent(window, "scroll", updateScrollValues, { passive: true })
    addDomEvent(window, "resize", updateScrollValues)
}

export function useViewportScroll() {
    useLayoutEffect(() => {
        !hasListeners && addEventListeners()
    }, [])

    return viewportScrollValues
}
