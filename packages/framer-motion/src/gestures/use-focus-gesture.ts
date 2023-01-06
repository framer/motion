import { AnimationType } from "../render/utils/types"
import { useDomEvent } from "../events/use-dom-event"
import { FeatureProps } from "../motion/features/types"
import { useCallback } from "react"

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useFocusGesture({
    whileFocus,
    visualElement,
}: FeatureProps<EventTarget>) {
    const { animationState } = visualElement

    const onFocus = useCallback(() => {
        animationState && animationState.setActive(AnimationType.Focus, true)
    }, [animationState])

    const onBlur = useCallback(() => {
        animationState && animationState.setActive(AnimationType.Focus, false)
    }, [animationState])

    useDomEvent(visualElement, "focus", whileFocus ? onFocus : undefined)
    useDomEvent(visualElement, "blur", whileFocus ? onBlur : undefined)
}
