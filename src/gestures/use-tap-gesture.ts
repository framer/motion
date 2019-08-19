import { RefObject, useRef } from "react"
import { EventInfo, Point, EventHandler } from "../events/types"
import { TargetAndTransition } from "../types"
import { isNodeOrChild } from "./utils/is-node-or-child"
import { getGesturePriority } from "./utils/gesture-priority"
import { ControlsProp, RemoveEvent } from "./types"
import { getGlobalLock } from "../behaviours/utils/lock"
import { addPointerEvent, usePointerEvent } from "../events/use-pointer-event"
import { useUnmountEffect } from "../utils/use-unmount-effect"

const tapGesturePriority = getGesturePriority("whileTap")

/**
 * Passed in to tap event handlers like `onTap` the `TapInfo` object contains
 * information about the tap gesture such as it‘s location.
 *
 * @library
 *
 * ```jsx
 * function onTap(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <Frame onTap={onTap} />
 * ```
 *
 * @motion
 *
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
     * @library
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTapStart={onTapStart} />
     * ```
     *
     * @motion
     *
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
     * @library
     *
     * ```jsx
     * function onTap(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTap={onTap} />
     * ```
     *
     * @motion
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
    onTap?(event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo): void

    /**
     * Callback when the tap gesture starts on this element.
     *
     * @library
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTapStart={onTapStart} />
     * ```
     *
     * @motion
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
    onTapStart?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: TapInfo
    ): void

    /**
     * Callback when the tap gesture ends outside this element.
     *
     * @library
     *
     * ```jsx
     * function onTapCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTapCancel={onTapCancel} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onTapCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapCancel={onTapCancel} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTapCancel?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: TapInfo
    ): void

    /**
     * Properties or variant label to animate to while the component is pressed.
     *
     * @library
     *
     * ```jsx
     * <Frame whileTap={{ scale: 0.8 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div whileTap={{ scale: 0.8 }} />
     * ```
     */
    whileTap?: string | TargetAndTransition
}

/**
 * @param handlers -
 * @internal
 */
export function useTapGesture(
    {
        onTap,
        onTapStart,
        onTapCancel,
        whileTap,
        controls,
    }: TapHandlers & ControlsProp,
    ref: RefObject<Element>
) {
    const hasTapListeners = onTap || onTapStart || onTapCancel || whileTap
    const isTapping = useRef(false)

    const cancelPointerEventListener = useRef<RemoveEvent | undefined | null>(
        null
    )

    function removePointerUp() {
        cancelPointerEventListener.current &&
            cancelPointerEventListener.current()
        cancelPointerEventListener.current = null
    }

    if (whileTap && controls) {
        controls.setOverride(whileTap, tapGesturePriority)
    }

    // We load this event handler into a ref so we can later refer to
    // onPointerUp.current which will always have reference to the latest props
    const onPointerUp = useRef<EventHandler | null>(null)
    onPointerUp.current = (event, info) => {
        const element = ref.current

        removePointerUp()
        if (!isTapping.current || !element) return

        isTapping.current = false

        if (controls && whileTap) {
            controls.clearOverride(tapGesturePriority)
        }

        // Check the gesture lock - if we get it, it means no drag gesture is active
        // and we can safely fire the tap gesture.
        const openGestureLock = getGlobalLock(true)
        if (!openGestureLock) return
        openGestureLock()

        if (!isNodeOrChild(element, event.target as Element)) {
            onTapCancel && onTapCancel(event, info)
        } else {
            onTap && onTap(event, info)
        }
    }

    function onPointerDown(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: EventInfo
    ) {
        removePointerUp()

        cancelPointerEventListener.current = addPointerEvent(
            window,
            "pointerup",
            (event, info) => onPointerUp.current!(event, info)
        )

        const element = ref.current
        if (!element || isTapping.current) return

        isTapping.current = true

        onTapStart && onTapStart(event, info)

        if (controls && whileTap) {
            controls.startOverride(tapGesturePriority)
        }
    }

    usePointerEvent(
        ref,
        "pointerdown",
        hasTapListeners ? onPointerDown : undefined
    )

    useUnmountEffect(removePointerUp)
}
