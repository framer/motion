import { useEffect, useContext } from "react"
import { MotionConfigContext } from "../../context/MotionConfigContext"
import { DraggableProps } from "./types"
import { VisualElementDragControls } from "./VisualElementDragControls"
import { useConstant } from "../../utils/use-constant"
import { VisualElement } from "../../render/types"

/**
 * A hook that allows an element to be dragged.
 *
 * @internal
 */
export function useDrag(props: DraggableProps, visualElement: VisualElement) {
    const { dragControls: groupDragControls } = props
    const { transformPagePoint } = useContext(MotionConfigContext)

    const dragControls = useConstant(() => {
        return new VisualElementDragControls({
            visualElement,
        })
    })

    dragControls.setProps({ ...props, transformPagePoint })

    // If we've been provided a DragControls for manual control over the drag gesture,
    // subscribe this component to it on mount.
    useEffect(
        () => groupDragControls && groupDragControls.subscribe(dragControls),
        [dragControls]
    )

    // Mount the drag controls with the visualElement
    useEffect(() => dragControls.mount(visualElement), [])
}
