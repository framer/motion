import { useEffect, RefObject } from "react"

export function addEventListener(
    target: Element | Document,
    eventName: string,
    handler?: EventListener | undefined,
    options?: AddEventListenerOptions
) {
    if (!handler) return

    target.addEventListener(eventName, handler, options)
    return () => target.removeEventListener(eventName, handler, options)
}

export function useDomEvent(
    ref: RefObject<Element>,
    eventName: string,
    handler?: EventListener | undefined,
    options?: AddEventListenerOptions
) {
    useEffect(
        () => {
            const element = ref.current

            if (handler && element) {
                return addEventListener(element, eventName, handler, options)
            }
        },
        [ref, eventName, handler, options]
    )
}
