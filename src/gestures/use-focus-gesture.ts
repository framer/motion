import { DomHandlers } from "motion/types"
import { useDomEvent } from "../events/use-dom-event"
import { VisualElement } from "../render/VisualElement"
import {
    setOverride,
    startOverride,
    clearOverride,
} from "../render/VisualElement/utils/overrides"
import { getGesturePriority } from "./utils/gesture-priority"

const hoverPriority = getGesturePriority("whileFocus")

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useFocusGesture(
    { whileFocus }: DomHandlers,
    visualElement: VisualElement
) {
    if (whileFocus) {
        setOverride(visualElement, whileFocus, hoverPriority)
    }

    useDomEvent(visualElement, "focus", () => {
        whileFocus && startOverride(visualElement, hoverPriority)
    })

    useDomEvent(visualElement, "blur", () => {
        whileFocus && clearOverride(visualElement, hoverPriority)
    })
}
