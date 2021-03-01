import { TargetAndTransition } from "../types"
import { AnimationType } from "../render/utils/types"
import { MotionProps, VariantLabels } from "../motion/types"
import { useDomEvent } from "../events/use-dom-event"
import { VisualElement } from "../render/types"

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
    { whileFocus }: MotionProps,
    visualElement: VisualElement
) {
    const onFocus = () => {
        visualElement.animationState?.setActive(AnimationType.Focus, true)
    }

    const onBlur = () => {
        visualElement.animationState?.setActive(AnimationType.Focus, false)
    }

    useDomEvent(visualElement, "focus", whileFocus ? onFocus : undefined)
    useDomEvent(visualElement, "blur", whileFocus ? onBlur : undefined)
}
