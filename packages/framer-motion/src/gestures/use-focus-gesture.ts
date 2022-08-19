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
    const { animationState } = visualElement
    const onFocus = () => {
        animationState && animationState.setActive(AnimationType.Focus, true)
    }

    const onBlur = () => {
        animationState && animationState.setActive(AnimationType.Focus, false)
    }

    useDomEvent(visualElement, "focus", whileFocus ? onFocus : undefined)
    useDomEvent(visualElement, "blur", whileFocus ? onBlur : undefined)
}
