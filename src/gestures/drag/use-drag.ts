import { useEffect, useContext } from "react"
import { MotionPluginContext } from "../../motion/context/MotionPluginContext"
import { DraggableProps } from "./types"
import { VisualElementDragControls } from "./VisualElementDragControls"
import { useConstant } from "../../utils/use-constant"
import { useIsPresent } from "../../components/AnimatePresence/use-presence"
import { VisualElement } from "../../render/VisualElement"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"

/**
 * A hook that allows an element to be dragged.
 *
 * @internal
 */
export function useDrag(props: DraggableProps, visualElement: VisualElement) {
    const { dragControls: groupDragControls } = props
    const { transformPagePoint } = useContext(MotionPluginContext)

    const dragControls = useConstant(
        () =>
            new VisualElementDragControls({
                visualElement: visualElement as HTMLVisualElement,
            })
    )
    dragControls.updateProps({ ...props, transformPagePoint })

    useDisableDragOnExit(dragControls)

    // If we've been provided a DragControls for manual control over the drag gesture,
    // subscribe this component to it on mount.
    useEffect(
        () => groupDragControls && groupDragControls.subscribe(dragControls),
        [dragControls]
    )

    // Mount the drag controls with the visualElement
    useEffect(() => dragControls.mount(visualElement as HTMLVisualElement), [])
}

/**
 * Disable drag on components that are exiting the tree as a child of AnimatePresence.
 * We might want to take another look at this to see if we maintain dragging while exiting,
 * for instance if we're crossfading between two dragging components.
 */
function useDisableDragOnExit(dragControls: VisualElementDragControls) {
    const isPresent = useIsPresent()
    useEffect(() => {
        if (!isPresent) dragControls.stopMotion()
    }, [isPresent])
}
