import { ElementOrSelector, resolveElements } from "../utils/resolve-elements"

export type OnHoverStartEvent = (event: PointerEvent) => void | OnHoverEndEvent
export type OnHoverEndEvent = (event: PointerEvent) => void

export function hover(
    elementOrSelector: ElementOrSelector,
    onHoverStart: OnHoverStartEvent
) {
    const elements = resolveElements(elementOrSelector)
    const cancelGesture = new AbortController()

    const options = { signal: cancelGesture.signal }

    const onPointerEnter = (enterEvent: PointerEvent) => {
        if (enterEvent.pointerType === "touch") return

        const { target } = enterEvent
        const onHoverEnd = onHoverStart(enterEvent)

        if (onHoverEnd && target) {
            const onPointerLeave = (leaveEvent: PointerEvent) => {
                onHoverEnd(leaveEvent)
                target.removeEventListener("pointerleave", onPointerLeave)
            }

            target.addEventListener("pointerleave", onPointerLeave, options)
        }
    }

    elements.forEach((element) => {
        element.addEventListener("pointerenter", onPointerEnter, options)
    })

    return () => cancelGesture.abort()
}
