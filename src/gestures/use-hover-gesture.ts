import { useMemo, SyntheticEvent } from "react"
import { AnimationControls } from "../motion"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"

export type HoverProps = {
    hoverActive?: TargetAndTransition
    onMouseEnter?: (e: SyntheticEvent) => void
    onMouseLeave?: (e: SyntheticEvent) => void
}

const hoverPriority = getGesturePriority("hover")

export const useHover = (
    { hoverActive, onMouseEnter, onMouseLeave }: HoverProps,
    controls: AnimationControls
) => {
    return useMemo(
        () => {
            if (!hoverActive) {
                return {}
            }

            return {
                onMouseEnter: (e: SyntheticEvent) => {
                    if (onMouseEnter) onMouseEnter(e)

                    if (hoverActive) {
                        controls.start(hoverActive, {
                            priority: hoverPriority,
                        })
                    }
                },
                onMouseLeave: (e: SyntheticEvent) => {
                    if (onMouseLeave) onMouseLeave(e)

                    if (hoverActive) {
                        controls.clearOverride(hoverPriority)
                    }
                },
            }
        },
        [hoverActive, onMouseEnter, onMouseLeave]
    )
}
