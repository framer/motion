import { TargetAndTransition } from "../types"
import { isMouseEvent } from "./utils/event-type"
import { usePointerEvent } from "../events/use-pointer-event"
import { EventInfo } from "../events/types"
import { VisualElement } from "../render/VisualElement"
import { AnimationType } from "../render/VisualElement/utils/animation-state"
import { VariantLabels } from "../motion/types"

/**
 * @public
 */
export interface HoverHandlers {
    /**
     * Properties or variant label to animate to while the hover gesture is recognised.
     *
     * @library
     *
     * ```jsx
     * <Frame whileHover={{ scale: 1.2 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div whileHover={{ scale: 1.2 }} />
     * ```
     */
    whileHover?: VariantLabels | TargetAndTransition

    /**
     * Callback function that fires when pointer starts hovering over the component.
     *
     * @library
     *
     * ```jsx
     * function onHoverStart(event) {
     *   console.log("Hover starts")
     * }
     *
     * <Frame onHoverStart={onHoverStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onHoverStart={() => console.log('Hover starts')} />
     * ```
     */
    onHoverStart?(event: MouseEvent, info: EventInfo): void

    /**
     * Callback function that fires when pointer stops hovering over the component.
     *
     * @library
     *
     * ```jsx
     * function onHoverEnd(event) {
     *   console.log("Hover ends")
     * }
     *
     * <Frame onHoverEnd={onHoverEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onHoverEnd={() => console.log("Hover ends")} />
     * ```
     */
    onHoverEnd?(event: MouseEvent, info: EventInfo): void
}

type FilteredTouchListener = (
    event: MouseEvent | PointerEvent,
    info: EventInfo
) => void

const filterTouch = (listener: FilteredTouchListener) => (
    event: MouseEvent | PointerEvent,
    info: EventInfo
) => {
    if (isMouseEvent(event)) listener(event, info)
}

/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useHoverGesture(
    { onHoverStart, onHoverEnd, whileHover }: HoverHandlers,
    visualElement: VisualElement
) {
    const onPointerEnter = filterTouch(
        (event: MouseEvent | PointerEvent, info: EventInfo) => {
            onHoverStart?.(event, info)
            visualElement.animationState?.setActive(AnimationType.Hover, true)
        }
    )

    const onPointerLeave = filterTouch(
        (event: MouseEvent | PointerEvent, info: EventInfo) => {
            onHoverEnd?.(event, info)
            visualElement.animationState?.setActive(AnimationType.Hover, false)
        }
    )

    usePointerEvent(
        visualElement,
        "pointerenter",
        onHoverStart || whileHover ? onPointerEnter : undefined
    )

    usePointerEvent(
        visualElement,
        "pointerleave",
        onHoverEnd || whileHover ? onPointerLeave : undefined
    )
}
