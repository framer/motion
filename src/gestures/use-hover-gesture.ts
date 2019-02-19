import { useMemo, RefObject } from "react"
import { getGesturePriority } from "./utils/gesture-priority"
import { TargetAndTransition } from "../types"
import { useConditionalPointerEvents } from "../events"
import { ControlsProp } from "./types"

/**
 * @public
 */
export interface HoverHandlers {
    /**
     * Properties or variant label to animate to while the hover gesture is recognised.
     *
     * ```jsx
     * const MyComponent = () => {
     *   return <Frame hover={{ scale: 1.2 }} />
     * }
     * ```
     */
    hover?: string | TargetAndTransition

    /**
     * Callback that fires when pointer starts hovering over the component.
     *
     * ```jsx
     * const MyComponent = () => {
     *   const onHoverStart = (event) => {
     *      console.log('Pointer is hovering over this Frame')
     *   }
     *
     *   return <Frame onHoverStart={onHoverStart} />
     * }
     * ```
     */
    onHoverStart?(event: MouseEvent): void

    /**
     * Callback that fires when pointer stops hovering over the component.
     *
     * ```jsx
     * const MyComponent = () => {
     *   const onHoverEnd = (event) => {
     *      console.log('Pointer stopped hovering over this Frame')
     *   }
     *
     *   return <Frame onHoverEnd={onHoverEnd} />
     * }
     * ```
     */
    onHoverEnd?(event: MouseEvent): void
}

const hoverPriority = getGesturePriority("hover")

// TODO: Optimisation here is find a way to conditionally add these listeners based on
// whether we're receiving hover or event listeners
/**
 *
 * @param props
 * @param ref
 * @internal
 */
export function useHoverGesture(
    { hover, onHoverStart, onHoverEnd, controls }: HoverHandlers & ControlsProp,
    ref?: RefObject<Element>
) {
    if (hover && controls) {
        controls.setOverride(hover, hoverPriority)
    }

    const handlers = useMemo(
        () => {
            const onPointerEnter = (event: MouseEvent) => {
                if (onHoverStart) onHoverStart(event)

                if (hover && controls) {
                    controls.startOverride(hoverPriority)
                }
            }

            const onPointerLeave = (event: MouseEvent) => {
                if (onHoverEnd) onHoverEnd(event)

                if (hover && controls) {
                    controls.clearOverride(hoverPriority)
                }
            }

            return { onPointerEnter, onPointerLeave }
        },
        [hover, onHoverStart, onHoverEnd, controls]
    )

    return useConditionalPointerEvents(handlers, ref)
}
