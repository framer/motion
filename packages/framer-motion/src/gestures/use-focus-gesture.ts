import { AnimationType } from "../render/utils/types"
import { useDomEvent } from "../events/use-dom-event"
import { FeatureProps } from "../motion/features/types"

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useFocusGesture({ whileFocus, visualElement }: FeatureProps) {
    const onFocus = () => {
        visualElement.animationState?.setActive(AnimationType.Focus, true)
    }

    const onBlur = () => {
        visualElement.animationState?.setActive(AnimationType.Focus, false)
    }

    useDomEvent(visualElement, "focus", whileFocus ? onFocus : undefined)
    useDomEvent(visualElement, "blur", whileFocus ? onBlur : undefined)
}
