import { AnimationType } from "../render/utils/types"
import { useDomEvent } from "../events/use-dom-event"
import { FeatureProps } from "../motion/features/types"
import { useCallback, useRef } from "react"

export function useFocusGesture({
    whileFocus,
    visualElement,
}: FeatureProps<Element>) {
    const isFocusActive = useRef(false)
    const { animationState } = visualElement

    const onFocus = useCallback(() => {
        let isFocusVisible = false

        /**
         * If this element doesn't match focus-visible then don't
         * apply whileHover. But, if matches throws that focus-visible
         * is not a valid selector then in that browser outline styles will be applied
         * to the element by default and we want to match that behaviour with whileFocus.
         */
        try {
            isFocusVisible = visualElement.current!.matches(":focus-visible")
        } catch (e) {
            isFocusVisible = true
        }

        if (!isFocusVisible || !animationState) return

        animationState.setActive(AnimationType.Focus, true)
        isFocusActive.current = true
    }, [animationState])

    const onBlur = useCallback(() => {
        if (!isFocusActive.current || !animationState) return
        animationState.setActive(AnimationType.Focus, false)
        isFocusActive.current = false
    }, [animationState])

    useDomEvent(visualElement, "focus", whileFocus ? onFocus : undefined)
    useDomEvent(visualElement, "blur", whileFocus ? onBlur : undefined)
}
