import { useMemo, RefObject } from "react"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"
import { useConditionalPointerEvents } from "../events"
import { ControlsProp } from "./types"

type HoverHandler = (event: Event) => void
export interface HoverHandlers {
    hover?: string | TargetAndTransition
    onHoverStart?: HoverHandler
    onHoverEnd?: HoverHandler
}

const hoverPriority = getGesturePriority("hover")

// TODO: Optimisation here is find a way to conditionally add these listeners based on
// whether we're receiving hover or event listeners
export const useHoverGesture = (
    { hover, onHoverStart, onHoverEnd, controls }: HoverHandlers & ControlsProp,
    ref?: RefObject<Element>
) => {
    const handlers = useMemo(
        () => {
            const onPointerEnter = (event: Event) => {
                if (onHoverStart) onHoverStart(event)

                if (hover && controls) {
                    controls.start(hover, {
                        priority: hoverPriority,
                    })
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
