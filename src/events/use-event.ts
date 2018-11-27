import { RefObject, useEffect } from "react"
import { ListenerControls, TargetBasedReturnType, TargetOrRef } from "./types"

export const eventListener = (
    target: EventTarget,
    name: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
): ListenerControls => {
    const startListening = () => {
        target.addEventListener(name, handler, options)
    }
    const stopListening = () => {
        target.removeEventListener(name, handler, options)
    }
    return [startListening, stopListening]
}

export const useEvent = <Target extends TargetOrRef>(
    type: string,
    target: Target,
    handler?: EventListener,
    options?: AddEventListenerOptions
): TargetBasedReturnType<Target> => {
    if (!handler) {
        return undefined as TargetBasedReturnType<Target>
    }
    if (target instanceof EventTarget) {
        return eventListener(target, type, handler, options) as TargetBasedReturnType<Target>
    }
    const ref = target as RefObject<EventTarget>
    useEffect(() => {
        if (!ref.current) {
            return
        }
        const [start, stop] = eventListener(ref.current, type, handler, options)
        start()
        return stop
    })
    return undefined as TargetBasedReturnType<Target>
}
