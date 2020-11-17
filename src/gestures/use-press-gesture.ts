import { useRef } from "react"
import { EventInfo, EventHandler } from "../events/types"
import { TargetAndTransition } from "../types"
import { isNodeOrChild } from "./utils/is-node-or-child"
import { RemoveEvent } from "./types"
import { getGlobalLock } from "../gestures/drag/utils/lock"
import { addPointerEvent, usePointerEvent } from "../events/use-pointer-event"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { pipe } from "popmotion"
import { Point2D } from "../types/geometry"
import { VisualElement } from "../render/VisualElement"
import { AnimationType } from "../render/VisualElement/utils/animation-state"
import { VariantLabels } from "../motion/types"

/**
 * Passed in to tap event handlers like `onPress` the `PressInfo` object contains
 * information about the tap gesture such as it‘s location.
 *
 * @library
 *
 * ```jsx
 * function onPress(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <Frame onPress={onPress} />
 * ```
 *
 * @motion
 *
 * ```jsx
 * function onPress(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <motion.div onPress={onPress} />
 * ```
 *
 * @public
 */
export interface PressInfo {
    /**
     * Contains `x` and `y` values for the tap gesture relative to the
     * device or page.
     *
     * @library
     *
     * ```jsx
     * function onPressStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPressStart={onPressStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPressStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPressStart={onPressStart} />
     * ```
     *
     * @public
     */
    point: Point2D
}

/**
 * @public
 */
export interface PressHandlers {
    /**
     * Callback when the tap gesture successfully ends on this element.
     *
     * @library
     *
     * ```jsx
     * function onPress(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPress={onPress} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPress(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPress={onPress} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link PressInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onPress?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PressInfo
    ): void

    /**
     * Callback when the tap gesture starts on this element.
     *
     * @library
     *
     * ```jsx
     * function onPressStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPressStart={onPressStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPressStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPressStart={onPressStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link PressInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onPressStart?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PressInfo
    ): void

    /**
     * Callback when the tap gesture ends outside this element.
     *
     * @library
     *
     * ```jsx
     * function onPressCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPressCancel={onPressCancel} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPressCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPressCancel={onPressCancel} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link PressInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onPressCancel?(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PressInfo
    ): void

    /**
     * Properties or variant label to animate to while the component is pressed.
     *
     * @library
     *
     * ```jsx
     * <Frame whilePress={{ scale: 0.8 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div whilePress={{ scale: 0.8 }} />
     * ```
     */
    whilePress?: VariantLabels | TargetAndTransition
}

/**
 * @param handlers -
 * @internal
 */
export function usePressGesture(
    { onPress, onPressStart, onPressCancel, whilePress }: PressHandlers,
    visualElement: VisualElement
) {
    const hasPressListeners =
        onPress || onPressStart || onPressCancel || whilePress
    const isPressing = useRef(false)

    const cancelPointerEventListener = useRef<RemoveEvent | undefined | null>(
        null
    )

    function removePointerUp() {
        cancelPointerEventListener.current?.()
        cancelPointerEventListener.current = null
    }

    // We load this event handler into a ref so we can later refer to
    // onPointerUp.current which will always have reference to the latest props
    const onPointerUp = useRef<EventHandler | null>(null)
    onPointerUp.current = (event, info) => {
        const element = visualElement.getInstance()

        removePointerUp()
        if (!isPressing.current || !element) return

        isPressing.current = false

        visualElement.animationState?.setActive(AnimationType.Press, false)

        // Check the gesture lock - if we get it, it means no drag gesture is active
        // and we can safely fire the tap gesture.
        const openGestureLock = getGlobalLock(true)
        if (!openGestureLock) return
        openGestureLock()

        if (!isNodeOrChild(element, event.target as Element)) {
            onPressCancel?.(event, info)
        } else {
            onPress?.(event, info)
        }
    }

    function onPointerDown(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: EventInfo
    ) {
        removePointerUp()

        cancelPointerEventListener.current = pipe(
            addPointerEvent(window, "pointerup", (event, info) =>
                onPointerUp.current?.(event, info)
            ),
            addPointerEvent(window, "pointercancel", (event, info) =>
                onPointerUp.current?.(event, info)
            )
        ) as RemoveEvent

        const element = visualElement.getInstance()
        if (!element || isPressing.current) return

        isPressing.current = true

        onPressStart?.(event, info)

        visualElement.animationState?.setActive(AnimationType.Press, true)
    }

    usePointerEvent(
        visualElement,
        "pointerdown",
        hasPressListeners ? onPointerDown : undefined
    )

    useUnmountEffect(removePointerUp)
}
