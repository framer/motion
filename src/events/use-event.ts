import { RefObject, useEffect } from "react"
import { ListenerControls, TargetBasedReturnType, TargetOrRef } from "./types"

function isEventTarget(target: any): target is EventTarget {
    return (
        typeof target.addEventListener === "function" &&
        typeof target.removeEventListener === "function"
    )
}

export const eventListener = (
    target: EventTarget | undefined,
    name: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
): ListenerControls => {
    const startListening = () => {
        if (!target) {
            return
        }
        // if (name === "pointermove") {
        //     console.log("Added pointermove", handler.renderId)
        // }
        target.addEventListener(name, handler, options)
    }
    const stopListening = () => {
        if (!target) {
            return
        }
        // if (name === "pointermove") {
        //     console.log("Removed pointermove", handler.renderId)
        // }
        target.removeEventListener(name, handler, options)
    }
    return [startListening, stopListening]
}

export const useEvent = <Target extends TargetOrRef>(
    type: string,
    target: Target | undefined,
    handler?: EventListener,
    options?: AddEventListenerOptions
): TargetBasedReturnType<Target> => {
    let result: ListenerControls | undefined = undefined
    if ((!target || isEventTarget(target)) && handler) {
        result = eventListener(
            target,
            type,
            handler,
            options
        ) as TargetBasedReturnType<Target>
    }

    useEffect(
        () => {
            const ref = target as RefObject<EventTarget>
            if (!handler || !target || isEventTarget(target) || !ref.current) {
                return
            }
            const [start, stop] = eventListener(
                ref.current,
                type,
                handler,
                options
            )
            start()
            return stop
        },
        [type, target, handler, options]
    )
    // useEffect(
    //     () => {
    //         if (type === "pointermove") {
    //             console.log(handler && handler.renderId)
    //             console.log(
    //                 "useEvent handler for pointermove changed. This should happen after each render"
    //             )
    //         }
    //     },
    //     [handler]
    // )
    return result as TargetBasedReturnType<Target>
}
