import { useEvent } from "./use-event"
import { wrapHandler } from "./event-info"
import {
    EventHandler,
    ListenerControls,
    TargetOrRef,
    TargetBasedReturnType,
} from "./types"
import { useRef } from "react"
import { safeWindow } from "./utils/window"

const noop: ListenerControls = [() => {}, () => {}]

const mergeUseEventResults = (
    ...values: (ListenerControls | undefined)[]
): ListenerControls => {
    if (values.every(v => v === undefined)) {
        return noop
    }
    const start = () => {
        for (const value of values) {
            if (value) {
                value[0]()
            }
        }
    }
    const stop = () => {
        for (const value of values) {
            if (value) {
                value[1]()
            }
        }
    }
    return [start, stop]
}

interface MouseEventHandlers {
    onMouseDown: EventHandler
    onMouseMove: EventHandler
    onMouseUp: EventHandler
    onMouseOver: EventHandler
    onMouseOut: EventHandler
    onMouseEnter: EventHandler
    onMouseLeave: EventHandler
}

export const useMouseEvents = <Target extends TargetOrRef>(
    {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseOver,
        onMouseOut,
        onMouseEnter,
        onMouseLeave,
    }: Partial<MouseEventHandlers>,
    ref: Target,
    options?: AddEventListenerOptions
): TargetBasedReturnType<Target> => {
    const down = useEvent("mousedown", ref, wrapHandler(onMouseDown), options)
    const move = useEvent("mousemove", ref, wrapHandler(onMouseMove), options)
    const up = useEvent("mouseup", ref, wrapHandler(onMouseUp), options)
    const over = useEvent("mouseover", ref, wrapHandler(onMouseOver), options)
    const out = useEvent("mouseout", ref, wrapHandler(onMouseOut), options)
    const enter = useEvent(
        "mouseenter",
        ref,
        wrapHandler(onMouseEnter),
        options
    )
    const leave = useEvent(
        "mouseleave",
        ref,
        wrapHandler(onMouseLeave),
        options
    )
    return mergeUseEventResults(
        down,
        move,
        up,
        over,
        out,
        enter,
        leave
    ) as TargetBasedReturnType<Target>
}

export interface TouchEventHandlers {
    onTouchStart: EventHandler
    onTouchMove: EventHandler
    onTouchEnd: EventHandler
    onTouchCancel: EventHandler
}

export const useTouchEvents = <Target extends TargetOrRef>(
    {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onTouchCancel,
    }: Partial<TouchEventHandlers>,
    ref: Target,
    options?: AddEventListenerOptions
): TargetBasedReturnType<Target> => {
    const down = useEvent("touchstart", ref, wrapHandler(onTouchStart), options)
    const move = useEvent("touchmove", ref, wrapHandler(onTouchMove), options)
    const up = useEvent("touchend", ref, wrapHandler(onTouchEnd), options)
    const cancel = useEvent(
        "touchcancel",
        ref,
        wrapHandler(onTouchCancel),
        options
    )
    return mergeUseEventResults(
        down,
        move,
        up,
        cancel
    ) as TargetBasedReturnType<Target>
}

export const useNativePointerEvents = <Target extends TargetOrRef>(
    {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onPointerOver,
        onPointerOut,
        onPointerEnter,
        onPointerLeave,
    }: Partial<PointerEventHandlers>,
    ref: Target,
    options?: AddEventListenerOptions
): TargetBasedReturnType<Target> => {
    const down = useEvent(
        "pointerdown",
        ref,
        wrapHandler(onPointerDown),
        options
    )

    // console.log(
    //     "%cPointer Move added/removed",
    //     "background: tomato; color: white; border-radius: 4px; padding: 2px 5px"
    // )

    const move = useEvent(
        "pointermove",
        ref,
        wrapHandler(onPointerMove),
        options
    )
    const up = useEvent("pointerup", ref, wrapHandler(onPointerUp), options)
    const cancel = useEvent(
        "pointercancel",
        ref,
        wrapHandler(onPointerCancel),
        options
    )
    const over = useEvent(
        "pointerover",
        ref,
        wrapHandler(onPointerOver),
        options
    )
    const out = useEvent("pointerout", ref, wrapHandler(onPointerOut), options)
    const enter = useEvent(
        "pointerenter",
        ref,
        wrapHandler(onPointerEnter),
        options
    )
    const leave = useEvent(
        "pointerleave",
        ref,
        wrapHandler(onPointerLeave),
        options
    )
    return mergeUseEventResults(
        down,
        move,
        up,
        cancel,
        over,
        out,
        enter,
        leave
    ) as TargetBasedReturnType<Target>
}

const supportsPointerEvents = () =>
    safeWindow.onpointerdown === null &&
    safeWindow.onpointermove === null &&
    safeWindow.onpointerup === null
const supportsTouchEvents = () =>
    safeWindow.ontouchstart === null &&
    safeWindow.ontouchmove === null &&
    safeWindow.ontouchend === null
const supportsMouseEvents = () =>
    safeWindow.onmousedown === null &&
    safeWindow.onmousemove === null &&
    safeWindow.onmouseup === null

export interface PointerEventHandlers {
    onPointerDown: EventHandler
    onPointerMove: EventHandler
    onPointerUp: EventHandler
    onPointerCancel: EventHandler
    onPointerOver: EventHandler
    onPointerOut: EventHandler
    onPointerEnter: EventHandler
    onPointerLeave: EventHandler
}

export const usePointerEvents = <Target extends TargetOrRef>(
    eventHandlers: Partial<PointerEventHandlers>,
    ref: Target,
    options?: AddEventListenerOptions
): TargetBasedReturnType<Target> => {
    // console.log("===================usePointerEvents===================")
    const {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onPointerOver,
        onPointerOut,
        onPointerEnter,
        onPointerLeave,
    } = eventHandlers
    let mouseEvents: Partial<MouseEventHandlers> = {},
        touchEvents: Partial<TouchEventHandlers> = {},
        pointerEvents: Partial<PointerEventHandlers> = {}
    if (supportsPointerEvents()) {
        pointerEvents = eventHandlers
    } else if (supportsTouchEvents()) {
        touchEvents = {
            onTouchStart: onPointerDown,
            onTouchMove: onPointerMove,
            onTouchEnd: onPointerUp,
            onTouchCancel: onPointerCancel,
        }
    } else if (supportsMouseEvents()) {
        mouseEvents = {
            onMouseDown: onPointerDown,
            onMouseMove: onPointerMove,
            onMouseUp: onPointerUp,
            onMouseOver: onPointerOver,
            onMouseOut: onPointerOut,
            onMouseEnter: onPointerEnter,
            onMouseLeave: onPointerLeave,
        }
    }
    const pointer = useNativePointerEvents(pointerEvents, ref, options)
    const touch = useTouchEvents(touchEvents, ref, options)
    const mouse = useMouseEvents(mouseEvents, ref, options)
    return mergeUseEventResults(pointer, touch, mouse) as TargetBasedReturnType<
        Target
    >
}

/**
 * A Conditional version of usePointerEvents
 * As opposed to usePointerEvents, this function does not require to pass a target or ref.
 * When calling this without a target, the handlers passed to the function are returned
 * @param eventHandlers
 * @param ref
 * @param options
 */
export const useConditionalPointerEvents = <
    Target extends TargetOrRef,
    Handlers extends Partial<PointerEventHandlers>
>(
    eventHandlers: Handlers,
    ref?: Target,
    options?: AddEventListenerOptions
): Handlers | undefined => {
    // console.log(
    //     "===================useConditionalPointerEvents==================="
    // )
    let pointerEventsRef: Target
    let pointerEventsHandlers: Partial<PointerEventHandlers>
    const emptyRef = useRef(null)
    // Because hooks can't be conditional, we need to this dance, instead of just an early return
    if (ref) {
        pointerEventsRef = ref
        pointerEventsHandlers = eventHandlers
    } else {
        pointerEventsRef = emptyRef as Target
        pointerEventsHandlers = {}
    }

    usePointerEvents(pointerEventsHandlers, pointerEventsRef, options)
    if (ref) {
        return undefined
    } else {
        return eventHandlers
    }
}
