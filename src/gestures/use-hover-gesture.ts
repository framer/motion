import { RefObject } from "react"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"
import { ControlsProp } from "./types"
import { isMouseEvent } from "./utils/event-type"
import { usePointerEvent } from "../events/use-pointer-event"
import { EventInfo } from "../events/types"

/**
 * @public
 */
export interface HoverHandlers {
    /**
     * Properties or variant label to animate to while the hover gesture is recognised.
     *
     * @library
     *
     * ```jsx
     * <Frame whileHover={{ scale: 1.2 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div whileHover={{ scale: 1.2 }} />
     * ```
     */
    whileHover?: string | TargetAndTransition

    /**
     * Callback function that fires when pointer starts hovering over the component.
     *
     * @library
     *
     * ```jsx
     * function onHoverStart(event) {
     *   console.log("Hover starts")
     * }
     *
     * <Frame onHoverStart={onHoverStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onHoverStart={() => console.log('Hover starts')} />
     * ```
     */
    onHoverStart?(event: MouseEvent, info: EventInfo): void

    /**
     * Callback function that fires when pointer stops hovering over the component.
     *
     * @library
     *
     * ```jsx
     * function onHoverEnd(event) {
     *   console.log("Hover ends")
     * }
     *
     * <Frame onHoverEnd={onHoverEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onHoverEnd={() => console.log("Hover ends")} />
     * ```
     */
    onHoverEnd?(event: MouseEvent, info: EventInfo): void
}

const hoverPriority = getGesturePriority("whileHover")

type FilteredTouchListener = (
    event: MouseEvent | PointerEvent,
    info: EventInfo
) => void

const filterTouch = (listener: FilteredTouchListener) => (
    event: MouseEvent | PointerEvent,
    info: EventInfo
) => {
    if (isMouseEvent(event)) listener(event, info)
}

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useHoverGesture(
    {
        whileHover,
        onHoverStart,
        onHoverEnd,
        controls,
    }: HoverHandlers & ControlsProp,
    ref: RefObject<Element>
) {
    if (whileHover && controls) {
        controls.setOverride(whileHover, hoverPriority)
    }

    usePointerEvent(
        ref,
        "pointerenter",
        filterTouch((event: MouseEvent | PointerEvent, info: EventInfo) => {
            if (onHoverStart) onHoverStart(event, info)

            if (whileHover && controls) {
                controls.startOverride(hoverPriority)
            }
        })
    )

    usePointerEvent(
        ref,
        "pointerleave",
        filterTouch((event: MouseEvent | PointerEvent, info: EventInfo) => {
            if (onHoverEnd) onHoverEnd(event, info)

            if (whileHover && controls) {
                controls.clearOverride(hoverPriority)
            }
        })
    )
}
