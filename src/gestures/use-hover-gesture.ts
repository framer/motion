import { useMemo, RefObject } from "react"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"
import { useConditionalPointerEvents } from "../events"
import { ControlsProp } from "./types"

type HoverHandler = (event: Event) => void
export interface HoverHandlers {
    hoverActive?: string | TargetAndTransition
    onHoverStart?: HoverHandler
    onHoverEnd?: HoverHandler
}

const hoverPriority = getGesturePriority("hover")

// TODO: Optimisation here is find a way to conditionally add these listeners based on
// whether we're receiving hoverActive or event listeners
export const useHoverGesture = (
    {
        hoverActive,
        onHoverStart,
        onHoverEnd,
        controls,
    }: HoverHandlers & ControlsProp,
    ref?: RefObject<Element>
) => {
    const handlers = useMemo(
        () => {
            const onPointerEnter = (event: Event) => {
                if (onHoverStart) onHoverStart(event)

                if (hoverActive && controls) {
                    controls.start(hoverActive, {
                        priority: hoverPriority,
                    })
                }
            }

            const onPointerLeave = (event: Event) => {
                if (onHoverEnd) onHoverEnd(event)

                if (hoverActive && controls) {
                    controls.clearOverride(hoverPriority)
                }
            }

            return { onPointerEnter, onPointerLeave }
        },
        [hoverActive, onHoverStart, onHoverEnd, controls]
    )

    return useConditionalPointerEvents(handlers, ref)
}
