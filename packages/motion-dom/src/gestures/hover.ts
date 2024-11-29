import { ElementOrSelector, resolveElements } from "../utils/resolve-elements"
import { isDragActive } from "./drag/state/is-active"

export type OnHoverStartEvent = (event: PointerEvent) => void | OnHoverEndEvent
export type OnHoverEndEvent = (event: PointerEvent) => void

const filterEvents = (callback: OnHoverStartEvent) => {
    return (event: PointerEvent) => {
        if (event.pointerType === "touch" || isDragActive()) return
        callback(event)
    }
}

export function hover(
    elementOrSelector: ElementOrSelector,
    onHoverStart: OnHoverStartEvent
) {
    const elements = resolveElements(elementOrSelector)
    const cancelGesture = new AbortController()

    const options = { signal: cancelGesture.signal }

    const onPointerEnter = filterEvents((enterEvent: PointerEvent) => {
        if (enterEvent.pointerType === "touch") return

        const { target } = enterEvent
        const onHoverEnd = onHoverStart(enterEvent)

        if (onHoverEnd && target) {
            const onPointerLeave = filterEvents((leaveEvent: PointerEvent) => {
                onHoverEnd(leaveEvent)
                target.removeEventListener("pointerleave", onPointerLeave)
            })

            target.addEventListener("pointerleave", onPointerLeave, options)
        }
    })

    elements.forEach((element) => {
        element.addEventListener("pointerenter", onPointerEnter, options)
    })

    return () => cancelGesture.abort()
}
