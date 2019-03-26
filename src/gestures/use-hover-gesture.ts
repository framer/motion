import { useMemo, RefObject } from "react"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"
import { useConditionalPointerEvents } from "../events"
import { ControlsProp } from "./types"

/**
 * @public
 */
export interface HoverHandlers {
    /**
     * Properties or variant label to animate to while the hover gesture is recognised.
     *
     * ```jsx
     * <motion.div whileHover={{ scale: 1.2 }} />
     * ```
     */
    whileHover?: string | TargetAndTransition

    /**
     * Callback function that fires when pointer starts hovering over the component.
     *
     * ```jsx
     * function onHoverStart(event) {
     *   console.log("Hover starts")
     * }
     *
     * <motion.div onHoverStart={onHoverStart} />
     * ```
     */
    onHoverStart?(event: MouseEvent): void

    /**
     * Callback function that fires when pointer stops hovering over the component.
     *
     * ```jsx
     * function onHoverEnd(event) {
     *   console.log("Hover ends")
     * }
     *
     * <motion.div onHoverEnd={onHoverEnd} />
     * ```
     */
    onHoverEnd?(event: MouseEvent): void
}

const hoverPriority = getGesturePriority("hover")

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
    ref?: RefObject<Element>
) {
    if (whileHover && controls) {
        controls.setOverride(whileHover, hoverPriority)
    }

    const handlers = useMemo(
        () => {
            const onPointerEnter = (event: MouseEvent) => {
                if (onHoverStart) onHoverStart(event)

                if (whileHover && controls) {
                    controls.startOverride(hoverPriority)
                }
            }

            const onPointerLeave = (event: MouseEvent) => {
                if (onHoverEnd) onHoverEnd(event)

                if (whileHover && controls) {
                    controls.clearOverride(hoverPriority)
                }
            }

            return { onPointerEnter, onPointerLeave }
        },
        [whileHover, onHoverStart, onHoverEnd, controls]
    )

    return useConditionalPointerEvents(handlers, ref)
}
