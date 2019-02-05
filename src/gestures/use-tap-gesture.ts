import { RefObject, useEffect, useMemo, useRef } from "react"
import {
    usePointerEvents,
    useConditionalPointerEvents,
    EventInfo,
    Point,
    EventHandler,
} from "../events"
import { TargetAndTransition } from "../types"
import { getGesturePriority } from "./utils/gesture-priority"
import { ControlsProp } from "./types"

interface TapInfo {
    point: Point
    devicePoint: Point
}

interface TapSession {
    target: EventTarget | null
}

type TapHandler = (session: TapInfo, event: Event) => void

export interface TapHandlers {
    onTap?: TapHandler
    onTapStart?: TapHandler
    onTapCancel?: TapHandler
    tap?: string | TargetAndTransition
}

/**
 * Explanation:
 *
 * Currently there's a problem where props can change while a gesture is active. In
 * this hook, we have event handlers that are created in `useMemo`, which is sync.
 * The event handlers themselves are activated in `useEvent` with `useEffect`, which
 * is async.
 *
 * Most event handlers are being set like this: onTap={() => {}}
 * This creates a new function every render, thus breaking `useMemo`. When any props
 * are set during a gesture, this creates a new event. We then have a `useEffect` in this
 * hook that, when props change, unsets the previous event handlers. I suspect that at
 * some point, the pointer up event is fired in between the previous one
 * being deactivate and the new one being activated.
 *
 * I attempted to rewrite the hook without `useMemo` at all but encountered the same issue.
 * At some point the `pointerUp` event is being unset and not reapplied until after it fires.
 *
 * By setting props to a ref we maintain longer gesture sessions and don't encounter this funny
 * business, but I'd rather a solution that required less code.
 *
 * @param props
 */
const usePropsRef = <T>(props: T) => {
    const propsRef = useRef(props)

    for (const key in props) {
        propsRef.current[key] = props[key]
    }

    return propsRef.current
}

export function useTapGesture(
    handlers: TapHandlers & ControlsProp
): { onPointerDown: EventHandler }
export function useTapGesture(
    handlers: TapHandlers & ControlsProp,
    ref: RefObject<Element>
): undefined
export function useTapGesture(
    props: TapHandlers & ControlsProp,
    ref?: RefObject<Element>
): undefined | { onPointerDown: EventHandler } {
    let session: TapSession | null = null
    const { onTap, onTapStart, onTapCancel, tap, controls } = props
    const propsRef = usePropsRef(props)

    const handlers = useMemo(
        () => {
            if (!onTap && !onTapStart && !onTapCancel && !tap) {
                return {
                    onPointerUp: () => {},
                    onPointerDown: () => {},
                }
            }

            const onPointerUp = (
                event: Event,
                { point, devicePoint }: EventInfo
            ) => {
                if (!session) {
                    return
                }

                if (controls && propsRef.tap) {
                    controls.clearOverride(getGesturePriority("tap"))
                }

                if (!ref || event.target !== ref.current) {
                    if (propsRef.onTapCancel) {
                        propsRef.onTapCancel({ point, devicePoint }, event)
                    }
                    return
                }

                if (propsRef.onTap) {
                    propsRef.onTap({ point, devicePoint }, event)
                }

                session = null
            }

            const onPointerDown = (
                event: Event,
                { point, devicePoint }: EventInfo
            ) => {
                startPointerUp()
                if (!ref || event.target !== ref.current) return
                session = {
                    target: event.target,
                }

                if (propsRef.onTapStart) {
                    propsRef.onTapStart({ point, devicePoint }, event)
                }

                if (controls && propsRef.tap) {
                    controls.start(propsRef.tap, {
                        priority: getGesturePriority("tap"),
                    })
                }
            }

            return { onPointerUp, onPointerDown }
        },
        [
            onTap === undefined,
            onTapStart === undefined,
            onTapCancel === undefined,
        ]
    )

    const [startPointerUp, stopPointerUp] = usePointerEvents(
        { onPointerUp: handlers.onPointerUp },
        window
    )

    useEffect(
        () => () => {
            stopPointerUp()
        },
        [handlers.onPointerUp]
    )

    return useConditionalPointerEvents(
        { onPointerDown: handlers.onPointerDown },
        ref
    )
}
