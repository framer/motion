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
    let result: ListenerControls | undefined = undefined
    if (target instanceof EventTarget && handler) {
        result = eventListener(target, type, handler, options) as TargetBasedReturnType<Target>
    }
    useEffect(
        () => {
            const ref = target as RefObject<EventTarget>
            if (!handler || target instanceof EventTarget || !ref.current) {
                return
            }
            const [start, stop] = eventListener(ref.current, type, handler, options)
            start()
            return stop
        },
        [type, target, handler, options]
    )
    return result as TargetBasedReturnType<Target>
}
