import { TargetAndTransition } from "../types"
import { VisualElement } from "../render/VisualElement"
import { AnimationType } from "../render/VisualElement/utils/animation-state"
import { VariantLabels } from "../motion/types"
import { useDomEvent } from "../events/use-dom-event"

/**
 * @public
 */
export interface FocusHandlers {
    /**
     * Properties or variant label to animate to while the focus gesture is recognised.
     *
     * @motion
     *
     * ```jsx
     * <motion.input whileFocus={{ scale: 1.2 }} />
     * ```
     */
    whileFocus?: VariantLabels | TargetAndTransition
}

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useFocusGesture(
    { whileFocus }: FocusHandlers,
    visualElement: VisualElement
) {
    useDomEvent(visualElement, "focus", () => {
        visualElement.animationState?.setActive(AnimationType.Focus, true)
    })

    useDomEvent(visualElement, "blur", () => {
        visualElement.animationState?.setActive(AnimationType.Focus, false)
    })
}
