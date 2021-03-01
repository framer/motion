import { useRef } from "react"
import { EventInfo } from "../events/types"
import { TargetAndTransition } from "../types"
import { isNodeOrChild } from "./utils/is-node-or-child"
import { addPointerEvent, usePointerEvent } from "../events/use-pointer-event"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { pipe } from "popmotion"
import { Point2D } from "../types/geometry"
import { AnimationType } from "../render/utils/types"
import { VariantLabels } from "../motion/types"
import { isDragActive } from "./drag/utils/lock"
import { VisualElement } from "../render/types"

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
    point: Point2D
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
    whileTap?: VariantLabels | TargetAndTransition
}

/**
 * @param handlers -
 * @internal
 */
export function useTapGesture(
    { onTap, onTapStart, onTapCancel, whileTap }: TapHandlers,
    visualElement: VisualElement
) {
    const hasPressListeners = onTap || onTapStart || onTapCancel || whileTap
    const isPressing = useRef(false)
    const cancelPointerEndListeners = useRef<Function | null>(null)

    function removePointerEndListener() {
        cancelPointerEndListeners.current?.()
        cancelPointerEndListeners.current = null
    }

    function checkPointerEnd() {
        removePointerEndListener()
        isPressing.current = false
        visualElement.animationState?.setActive(AnimationType.Tap, false)
        return !isDragActive()
    }

    function onPointerUp(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        /**
         * We only count this as a tap gesture if the event.target is the same
         * as, or a child of, this component's element
         */
        !isNodeOrChild(visualElement.getInstance(), event.target as Element)
            ? onTapCancel?.(event, info)
            : onTap?.(event, info)
    }

    function onPointerCancel(event: PointerEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        onTapCancel?.(event, info)
    }

    function onPointerDown(event: PointerEvent, info: EventInfo) {
        removePointerEndListener()

        if (isPressing.current) return
        isPressing.current = true

        cancelPointerEndListeners.current = pipe(
            addPointerEvent(window, "pointerup", onPointerUp),
            addPointerEvent(window, "pointercancel", onPointerCancel)
        )

        onTapStart?.(event, info)

        visualElement.animationState?.setActive(AnimationType.Tap, true)
    }

    usePointerEvent(
        visualElement,
        "pointerdown",
        hasPressListeners ? onPointerDown : undefined
    )

    useUnmountEffect(removePointerEndListener)
}
