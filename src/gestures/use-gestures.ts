import { PanHandlers, usePanGesture } from "./use-pan-gesture"
import { TapHandlers, useTapGesture } from "./use-tap-gesture"
import { HoverHandlers, useHoverGesture } from "./use-hover-gesture"
import { VisualElement } from "../render/VisualElement"

/**
 * @public
 */
export type GestureHandlers = PanHandlers & TapHandlers & HoverHandlers

/**
 * Add pan and tap gesture recognition to an element.
 *
 * @param props - Gesture event handlers
 * @param ref - React `ref` containing a DOM `Element`
 * @public
 */
export function useGestures<GestureHandlers>(
    props: GestureHandlers,
    ref: VisualElement
) {
    usePanGesture(props, ref)
    useTapGesture(props, ref)
    useHoverGesture(props, ref)
}
