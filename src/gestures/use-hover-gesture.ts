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

export const useHoverGesture = (
    {
        hoverActive,
        onHoverStart,
        onHoverEnd,
        controls,
    }: HoverHandlers & ControlsProp,
    ref?: RefObject<Element>
) => {
    const onPointerEnter = useMemo(
        () => (event: Event) => {
            if (onHoverStart) {
                onHoverStart(event)
            }
            if (hoverActive && controls) {
                controls.start(hoverActive, {
                    priority: hoverPriority,
                })
            }
        },
        [hoverActive, onHoverStart, controls]
    )

    const onPointerLeave = useMemo(
        () => (event: Event) => {
            if (onHoverEnd) onHoverEnd(event)

            if (hoverActive && controls) {
                controls.clearOverride(hoverPriority)
            }
        },
        [hoverActive, onHoverEnd, controls]
    )

    return useConditionalPointerEvents({ onPointerEnter, onPointerLeave }, ref)
}
