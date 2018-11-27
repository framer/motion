import { RefObject, useEffect } from "react"

export const eventListener = (
    target: EventTarget,
    name: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
): [() => void, () => void] => {
    const startListening = () => {
        target.addEventListener(name, handler, options)
    }
    const stopListening = () => {
        target.removeEventListener(name, handler, options)
    }
    return [startListening, stopListening]
}

export const useEvent = (
    type: string,
    ref: RefObject<EventTarget> | EventTarget,
    handler?: EventListener,
    options?: AddEventListenerOptions
): [() => void, () => void] | undefined => {
    if (!handler) {
        return
    }
    if (ref instanceof EventTarget) {
        return eventListener(ref, type, handler, options)
    }
    useEffect(() => {
        if (!handler || !ref.current) {
            return
        }
        const [start, stop] = eventListener(ref.current, type, handler, options)
        start()
        return stop
    })
    return
}
