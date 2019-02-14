import { RefObject } from "react"
import { PanHandlers, usePanGesture } from "./use-pan-gesture"
import { TapHandlers, useTapGesture } from "./use-tap-gesture"
import { HoverHandlers, useHoverGesture } from "./use-hover-gesture"

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
    ref: RefObject<Element>
) {
    usePanGesture(props, ref)
    useTapGesture(props, ref)
    useHoverGesture(props, ref)
}
