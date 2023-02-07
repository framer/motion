import { addDomEvent } from "../events/use-dom-event"
import { AnimationType } from "../render/utils/types"
import type { VisualElement as MotionNode } from "../render/VisualElement"
import { noop } from "../utils/noop"
import { pipe } from "../utils/pipe"

export function focus(node: MotionNode<Element>) {
    let cleanEvents: Function = noop
    let isFocusActive = false

    const onFocus = () => {
        let isFocusVisible = false

        /**
         * If this element doesn't match focus-visible then don't
         * apply whileHover. But, if matches throws that focus-visible
         * is not a valid selector then in that browser outline styles will be applied
         * to the element by default and we want to match that behaviour with whileFocus.
         */
        try {
            isFocusVisible = node.current!.matches(":focus-visible")
        } catch (e) {
            isFocusVisible = true
        }

        if (!isFocusVisible || !node.animationState) return

        node.animationState.setActive(AnimationType.Focus, true)
        isFocusActive = true
    }

    const onBlur = () => {
        if (!isFocusActive || !node.animationState) return
        node.animationState.setActive(AnimationType.Focus, false)
        isFocusActive = false
    }

    const cleanListeners = pipe(
        node.once("Effect", () => {
            cleanEvents = pipe(
                addDomEvent(node.current!, "focus", onFocus),
                addDomEvent(node.current!, "blur", onBlur)
            )
        }),
        node.once("Unmount", () => {
            cleanEvents()
            cleanListeners()
        })
    )

    return () => {
        cleanEvents()
        cleanListeners()
    }
}
