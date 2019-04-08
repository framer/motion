import { RefObject, useEffect, useMemo, useRef } from "react"
import {
    usePointerEvents,
    useConditionalPointerEvents,
    EventInfo,
    Point,
    EventHandler,
} from "../events"
import { TargetAndTransition } from "../types"
import { isNodeOrChild } from "./utils/is-node-or-child"
import { getGesturePriority } from "./utils/gesture-priority"
import { ControlsProp } from "./types"
import { safeWindow } from "../events/utils/window"
import { getGlobalLock } from "../behaviours/utils/lock"

const tapGesturePriority = getGesturePriority("whileTap")

/**
 * Passed in to tap event handlers like `onTap` the `TapInfo` object contains
 * information about the tap gesture such as it‘s location.
 *
 * @remarks
 * ```jsx
 * function onTap(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <motion.div onTap={onTap} />
 * ```
 *
 * @public
 */
export interface TapInfo {
    /**
     * Contains `x` and `y` values for the tap gesture relative to the
     * device or page.
     *
     * @remarks
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapStart={onTapStart} />
     * ```
     *
     * @public
     */
    point: Point
}

/**
 * @public
 */
export interface TapHandlers {
    /**
     * Callback when the tap gesture successfully ends on this element.
     *
     * ```jsx
     * function onTap(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTap={onTap} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTap?(event: MouseEvent | TouchEvent, info: TapInfo): void

    /**
     * Callback when the tap gesture starts on this element.
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapStart={onTapStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTapStart?(event: MouseEvent | TouchEvent, info: TapInfo): void

    /**
     * Callback when the tap gesture ends outside this element.
     *
     * ```jsx
     * function onTapCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * return <motion.div onTapCancel={onTapCancel} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTapCancel?(event: MouseEvent | TouchEvent, info: TapInfo): void

    /**
     * Properties or variant label to animate to while the component is pressed.
     *
     * ```jsx
     * <motion.div whileTap={{ scale: 0.8 }} />
     * ```
     */
    whileTap?: string | TargetAndTransition
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
    const isTapping = useRef(false)
    const { onTap, onTapStart, onTapCancel, whileTap, controls } = props
    const propsRef = usePropsRef(props)

    if (whileTap && controls) {
        controls.setOverride(whileTap, tapGesturePriority)
    }

    const handlers = useMemo(
        () => {
            if (!onTap && !onTapStart && !onTapCancel && !whileTap) {
                return {
                    onPointerUp: () => {},
                    onPointerDown: () => {},
                }
            }

            const onPointerUp = (
                event: MouseEvent | TouchEvent,
                { point }: EventInfo
            ) => {
                if (!isTapping.current) {
                    return
                }

                isTapping.current = false

                if (controls && propsRef.whileTap) {
                    controls.clearOverride(tapGesturePriority)
                }

                // Check the gesture lock - if we get it, it means no drag gesture is active
                // and we can safely fire the tap gesture.
                const openGestureLock = getGlobalLock(true)

                if (!openGestureLock) {
                    return
                }
                openGestureLock()

                if (
                    !ref ||
                    !ref.current ||
                    !isNodeOrChild(ref.current, event.target as Element)
                ) {
                    if (propsRef.onTapCancel) {
                        propsRef.onTapCancel(event, { point })
                    }
                    return
                }

                if (propsRef.onTap) {
                    propsRef.onTap(event, { point })
                }
            }

            const onPointerDown = (
                event: MouseEvent | TouchEvent,
                { point }: EventInfo
            ) => {
                startPointerUp()
                if (!ref || !ref.current) return
                isTapping.current = true

                if (propsRef.onTapStart) {
                    propsRef.onTapStart(event, { point })
                }

                if (controls && propsRef.whileTap) {
                    controls.startOverride(tapGesturePriority)
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
