import { PanHandlers, usePanGesture } from "./use-pan-gesture"
import { PressHandlers, usePressGesture } from "./use-press-gesture"
import { HoverHandlers, useHoverGesture } from "./use-hover-gesture"
import { VisualElement } from "../render/VisualElement"

/**
 * @public
 */
export type GestureHandlers = PanHandlers & PressHandlers & HoverHandlers

/**
 * Add pan and tap gesture recognition to an element.
 *
 * @param props - Gesture event handlers
 * @param ref - React `ref` containing a DOM `Element`
 * @public
 */
export function useGestures<GestureHandlers>(
    props: GestureHandlers,
    visualElement: VisualElement
) {
    usePanGesture(props, visualElement)
    usePressGesture(props, visualElement)
    useHoverGesture(props, visualElement)
}
