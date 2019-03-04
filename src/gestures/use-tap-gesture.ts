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
import { safeWindow } from "../events/utils/window"

const pressGesturePriority = getGesturePriority("press")

interface TapInfo {
    point: Point
}

interface TapSession {
    target: EventTarget | null
}

/**
 * @public
 */
export interface TapHandlers {
    /**
     * Callback when the tap gesture successfully ends on this element.
     *
     * ```jsx
     * function App() {
     *   const onTap = (event, { point }) => {
     *      console.log(`Tapped at ${point.x} ${point.y}`)
     *   }
     *
     *   return <motion.div onTap={onPan} />
     * }
     * ```
     */
    onTap?(event: MouseEvent | TouchEvent, info: TapInfo): void

    /**
     * Callback when the tap gesture starts on this element.
     *
     * ```jsx
     * function App() {
     *   const onTapStart = (event, { point }) => {
     *      console.log(`Tap started at ${point.x} ${point.y}`)
     *   }
     *
     *   return <motion.div onTapStart={onPan} />
     * }
     * ```
     */
    onTapStart?(event: MouseEvent | TouchEvent, info: TapInfo): void

    /**
     * Callback when the tap gesture ends outside this element.
     *
     * ```jsx
     * function App() {
     *   const onTapCancel = (event, { point }) => {
     *      console.log(`Tap cancelled at ${point.x} ${point.y}`)
     *   }
     *
     *   return <motion.div onTapCancel={onPan} />
     * }
     * ```
     */
    onTapCancel?(event: MouseEvent | TouchEvent, info: TapInfo): void

    /**
     * Properties or variant label to animate to while the component is pressed.
     *
     * ```jsx
     * function App() {
     *   return <motion.div press={{ scale: 0.8 }} />
     * }
     *
     * // With variants
     * function App() {
     *   const variants = {
     *     pressed: { scale: 0.8 }
     *   }
     *
     *   return <motion.div variants={variants} press="pressed" />
     * }
     * ```
     */
    press?: string | TargetAndTransition
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

/**
 * @param handlers
 * @internal
 */
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
    const { onTap, onTapStart, onTapCancel, press, controls } = props
    const propsRef = usePropsRef(props)

    if (press && controls) {
        controls.setOverride(press, pressGesturePriority)
    }

    const handlers = useMemo(
        () => {
            if (!onTap && !onTapStart && !onTapCancel && !press) {
                return {
                    onPointerUp: () => {},
                    onPointerDown: () => {},
                }
            }

            const onPointerUp = (
                event: MouseEvent | TouchEvent,
                { point }: EventInfo
            ) => {
                if (!session) {
                    return
                }

                if (controls && propsRef.press) {
                    controls.clearOverride(pressGesturePriority)
                }

                if (!ref || event.target !== ref.current) {
                    if (propsRef.onTapCancel) {
                        propsRef.onTapCancel(event, { point })
                    }
                    return
                }

                if (propsRef.onTap) {
                    propsRef.onTap(event, { point })
                }

                session = null
            }

            const onPointerDown = (
                event: MouseEvent | TouchEvent,
                { point }: EventInfo
            ) => {
                startPointerUp()
                if (!ref || event.target !== ref.current) return
                session = {
                    target: event.target,
                }

                if (propsRef.onTapStart) {
                    propsRef.onTapStart(event, { point })
                }

                if (controls && propsRef.press) {
                    controls.startOverride(pressGesturePriority)
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
        safeWindow
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
