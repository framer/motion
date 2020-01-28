import * as React from "react"
import { useConstant } from "../utils/use-constant"
import {
    ComponentDragControls,
    DragControlOptions,
} from "./ComponentDragControls"

/**
 * Usually, dragging is initiated by pressing down on a `motion` component with a `drag` prop
 * and moving it. For some use-cases, for instance clicking at an arbitrary point on a video scrubber, we
 * might want to initiate that dragging from a different component than the draggable one.
 *
 * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
 * the draggable component's `dragControls` prop. It exposes a `start` method
 * that can start dragging from pointer events on other components.
 *
 * @library
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * return (
 *   <>
 *     <Frame onTapStart={(event) => dragControls.start(event, { snapToCursor: true })} />
 *     <Frame drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @motion
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * return (
 *   <>
 *     <div onMouseDown={(event) => dragControls.start(event, { snapToCursor: true })} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 * @public
 */
export class DragControls {
    private componentControls = new Set<ComponentDragControls>()

    subscribe(controls: ComponentDragControls): () => void {
        this.componentControls.add(controls)
        return () => this.componentControls.delete(controls)
    }

    start(
        event:
            | React.MouseEvent
            | React.TouchEvent
            | React.PointerEvent
            | MouseEvent
            | TouchEvent
            | PointerEvent,
        options?: DragControlOptions
    ) {
        this.componentControls.forEach(controls => {
            controls.start(
                (event as React.MouseEvent).nativeEvent || event,
                options
            )
        })
    }
}

const createDragControls = () => new DragControls()

/**
 *
 *
 * @public
 */
export function useDragControls() {
    return useConstant(createDragControls)
}
