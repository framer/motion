import { RefObject } from "react"
import { PanHandlers, usePanGesture } from "./use-pan-gesture"
import { TapHandlers, useTapGesture } from "./use-tap-gesture"
import { HoverHandlers, useHoverGesture } from "./use-hover-gesture"

export type GestureHandlers = PanHandlers & TapHandlers & HoverHandlers
/**
 * Add pan and tap gesture recognition to an element.
 *
 * @remarks
 * `useGestures` is an unopinionated way to add pan and tap gesture recognition to an element.
 *
 * ## Pan
 *
 * A pan is defined as when a user's pointer presses an element and move beyond and initial threshold.
 *
 * The pan gesture can be handled with three event handlers: `onPanStart`, `onPan` and `onPanEnd`.
 *
 * Each event handler function receives the originating pointer event as its first argument.
 *
 * As a second argument, the following pointer information is provided as x/y coordinates:
 *
 * - `point`: The point, relative to the page
 * - `delta`: The movement from the previous pan movement
 * - `offset`: The movement from the point's origin,
 * - `velocity`: The velocity of the point
 *
 * ## Tap
 *
 * A tap is defined as a user pressing their pointer on an element and releasing it on the same element.
 *
 * The tap gesture can be handled with three event handlers: `onTapStart`, `onTap`, `onTapCancel`.
 *
 * Each event handler function receives the originating pointer event as its first argument.
 *
 * As a second argument, the following pointer information is provided as x/y coordinates:
 *
 * - `point`: The point, relative to the page
 *
 * @param props
 * @param ref
 * @public
 */
export function useGestures<P extends GestureHandlers>(
    props: P,
    ref: RefObject<Element>
) {
    usePanGesture(props, ref)
    useTapGesture(props, ref)
    useHoverGesture(props, ref)
}
