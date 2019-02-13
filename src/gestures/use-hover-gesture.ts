import { useMemo, RefObject } from "react"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"
import { useConditionalPointerEvents } from "../events"
import { ControlsProp } from "./types"

type HoverHandler = (event: Event) => void
export interface HoverHandlers {
    /**
     * Properties or variant label to animate to while the hover gesture is recognised
     */
    hover?: string | TargetAndTransition

    /**
     * Callback that fires when pointer starts hovering over the component
     */
    onHoverStart?: HoverHandler

    /**
     * Callback that fires when pointer stops hovering over the component
     */
    onHoverEnd?: HoverHandler
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
    { hover, onHoverStart, onHoverEnd, controls }: HoverHandlers & ControlsProp,
    ref?: RefObject<Element>
) {
    if (hover && controls) {
        controls.setOverride(hover, hoverPriority)
    }

    const handlers = useMemo(
        () => {
            const onPointerEnter = (event: Event) => {
                if (onHoverStart) onHoverStart(event)

                if (hover && controls) {
                    controls.startOverride(hoverPriority)
                }
            }

            const onPointerLeave = (event: Event) => {
                if (onHoverEnd) onHoverEnd(event)

                if (hover && controls) {
                    controls.clearOverride(hoverPriority)
                }
            }

            return { onPointerEnter, onPointerLeave }
        },
        [hover, onHoverStart, onHoverEnd, controls]
    )

    return useConditionalPointerEvents(handlers, ref)
}
