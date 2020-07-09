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
 * @param param
 * @param ref
 * @param values
 * @param controls
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

    useEffect(
        () => groupDragControls && groupDragControls.subscribe(dragControls),
        [dragControls]
    )

    useEffect(() => dragControls.mount(visualElement as HTMLVisualElement), [])
}

function useDisableDragOnExit(dragControls: VisualElementDragControls) {
    const isPresent = useIsPresent()
    useEffect(() => {
        if (!isPresent) dragControls.stopMotion()
    }, [isPresent])
}
