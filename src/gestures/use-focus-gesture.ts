import { TargetAndTransition } from "../types"
import { VisualElement } from "../render/VisualElement"
import { AnimationType } from "../render/VisualElement/utils/animation-state"
import { VariantLabels } from "../motion/types"
import { useDomEvent } from "events/use-dom-event"

/**
 * @public
 */
export interface FocusHandlers {
    /**
     * Properties or variant label to animate to while the focus gesture is recognised.
     *
     * @library
     *
     * ```jsx
     * <Frame whileFocus={{ scale: 1.2 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div whileFocus={{ scale: 1.2 }} />
     * ```
     */
    whileFocus?: VariantLabels | TargetAndTransition

    /**
     * Callback function that fires when the component receives focus.
     *
     * @library
     *
     * ```jsx
     * function onFocusStart(event) {
     *   console.log("Focus starts")
     * }
     *
     * <Frame onFocusStart={onFocusStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onFocusStart={() => console.log('Focus starts')} />
     * ```
     */
    onFocusStart?(event: FocusEvent): void

    /**
     * Callback function that fires when the component loses focus.
     *
     * @library
     *
     * ```jsx
     * function onFocusEnd(event) {
     *   console.log("Focus ends")
     * }
     *
     * <Frame onFocusEnd={onFocusEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onFocusEnd={() => console.log("Focus ends")} />
     * ```
     */
    onFocusEnd?(event: FocusEvent): void
}

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useFocusGesture(
    { onFocusStart, onFocusEnd }: FocusHandlers,
    visualElement: VisualElement
) {
    useDomEvent(visualElement, "focus", () => (event: FocusEvent) => {
        onFocusStart?.(event)
        visualElement.animationState?.setActive(AnimationType.Focus, true)
    })

    useDomEvent(visualElement, "blur", () => (event: FocusEvent) => {
        onFocusEnd?.(event)
        visualElement.animationState?.setActive(AnimationType.Focus, false)
    })
}
