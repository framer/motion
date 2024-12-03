import { ElementOrSelector, resolveElements } from "../utils/resolve-elements"
import { isDragActive } from "./drag/state/is-active"

/**
 * Options for the hover gesture.
 *
 * @public
 */
export interface HoverOptions {
    /**
     * Use passive event listeners. Doing so allows the browser to optimize
     * scrolling performance by not allowing the use of `preventDefault()`.
     *
     * @default true
     */
    passive?: boolean

    /**
     * Remove the event listener after the first event.
     *
     * @default false
     */
    once?: boolean
}

/**
 * A function to be called when a hover gesture starts.
 *
 * This function can optionally return a function that will be called
 * when the hover gesture ends.
 *
 * @public
 */
export type OnHoverStartEvent = (event: PointerEvent) => void | OnHoverEndEvent

/**
 * A function to be called when a hover gesture ends.
 *
 * @public
 */
export type OnHoverEndEvent = (event: PointerEvent) => void

/**
 * Filter out events that are not pointer events, or are triggering
 * while a Motion gesture is active.
 */
function filterEvents(callback: OnHoverStartEvent) {
    return (event: PointerEvent) => {
        if (event.pointerType === "touch" || isDragActive()) return
        callback(event)
    }
}

/**
 * Create a hover gesture. hover() is different to .addEventListener("pointerenter")
 * in that it has an easier syntax, filters out polyfilled touch events, interoperates
 * with drag gestures, and automatically removes the "pointerennd" event listener when the hover ends.
 *
 * @public
 */
export function hover(
    elementOrSelector: ElementOrSelector,
    onHoverStart: OnHoverStartEvent,
    options: HoverOptions = {}
) {
    const gestureAbortController = new AbortController()

    const eventOptions = {
        passive: true,
        ...options,
        signal: gestureAbortController.signal,
    }

    const onPointerEnter = filterEvents((enterEvent: PointerEvent) => {
        const { target } = enterEvent
        const onHoverEnd = onHoverStart(enterEvent)

        if (!onHoverEnd || !target) return

        const onPointerLeave = filterEvents((leaveEvent: PointerEvent) => {
            onHoverEnd(leaveEvent)
            target.removeEventListener("pointerleave", onPointerLeave)
        })

        target.addEventListener("pointerleave", onPointerLeave, eventOptions)
    })

    resolveElements(elementOrSelector).forEach((element) => {
        element.addEventListener("pointerenter", onPointerEnter, eventOptions)
    })

    return () => gestureAbortController.abort()
}
