import { addDomEvent } from "../events/add-dom-event"
import { Feature } from "../motion/features/Feature"
import { AnimationType } from "../render/utils/types"
import { noop } from "../utils/noop"
import { pipe } from "../utils/pipe"

export class FocusGesture extends Feature<Element> {
    private isActive = false

    private removeEventListeners: Function = noop

    mount() {
        const onFocus = () => {
            let isFocusVisible = false

            /**
             * If this element doesn't match focus-visible then don't
             * apply whileHover. But, if matches throws that focus-visible
             * is not a valid selector then in that browser outline styles will be applied
             * to the element by default and we want to match that behaviour with whileFocus.
             */
            try {
                isFocusVisible = this.node.current!.matches(":focus-visible")
            } catch (e) {
                isFocusVisible = true
            }

            if (!isFocusVisible || !this.node.animationState) return

            this.node.animationState.setActive(AnimationType.Focus, true)
            this.isActive = true
        }

        const onBlur = () => {
            if (!this.isActive || !this.node.animationState) return
            this.node.animationState.setActive(AnimationType.Focus, false)
            this.isActive = false
        }

        this.removeEventListeners = pipe(
            addDomEvent(this.node.current!, "focus", onFocus),
            addDomEvent(this.node.current!, "blur", onBlur)
        )
    }

    unmount() {
        this.removeEventListeners()
    }
}
