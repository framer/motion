import { TargetAndTransition } from "../types"
import { isMouseEvent } from "./utils/event-type"
import { EventInfo } from "../events/types"
import { VisualElement } from "../render/VisualElement"
import { AnimationType } from "../render/VisualElement/utils/animation-state"
import { VariantLabels } from "../motion/types"
import { elementDragControls } from "./drag/VisualElementDragControls"
import { usePointerEvent } from "../events/use-pointer-event"

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

function createHoverEvent(
    visualElement: VisualElement,
    isActive: boolean,
    callback?: (event: MouseEvent, info: EventInfo) => void
) {
    return filterTouch((event, info) => {
        const handler = () => {
            callback?.(event, info)
            visualElement.animationState?.setActive(
                AnimationType.Hover,
                isActive
            )
        }

        const controls = elementDragControls.get(visualElement)
        if (controls?.isDragging) {
            controls!.hoverEventToFlush = handler
        } else {
            visualElement.isHoverEventsEnabled && handler()
        }
    })
}

export function useHoverGesture(
    { onHoverStart, onHoverEnd, whileHover }: HoverHandlers,
    visualElement: VisualElement
) {
    usePointerEvent(
        visualElement,
        "pointerenter",
        onHoverStart || whileHover
            ? createHoverEvent(visualElement, true, onHoverStart)
            : undefined
    )

    usePointerEvent(
        visualElement,
        "pointerleave",
        onHoverEnd || whileHover
            ? createHoverEvent(visualElement, false, onHoverEnd)
            : undefined
    )
}
