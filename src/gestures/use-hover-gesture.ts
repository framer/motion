import { RefObject } from "react"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"
import { ControlsProp } from "./types"
import { isMouseEvent } from "./utils/event-type"
import { useDomEvent } from "../events/use-dom-event"

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
    onHoverStart?(event: MouseEvent): void

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
    onHoverEnd?(event: MouseEvent): void
}

const hoverPriority = getGesturePriority("whileHover")

const filterTouch = (
    listener: (event: MouseEvent | TouchEvent | PointerEvent) => void
) => (event: MouseEvent | TouchEvent | PointerEvent) => {
    if (isMouseEvent(event)) listener(event)
}

// TODO: Optimisation here is find a way to conditionally add these listeners based on
// whether we're receiving hover or event listeners
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

    useDomEvent(
        ref,
        "mouseenter",
        filterTouch((event: MouseEvent | PointerEvent) => {
            if (onHoverStart) onHoverStart(event)

            if (whileHover && controls) {
                controls.startOverride(hoverPriority)
            }
        })
    )

    useDomEvent(
        ref,
        "mouseleave",
        filterTouch((event: MouseEvent | PointerEvent) => {
            if (onHoverEnd) onHoverEnd(event)

            if (whileHover && controls) {
                controls.clearOverride(hoverPriority)
            }
        })
    )
}
