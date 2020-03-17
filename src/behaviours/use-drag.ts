import { useEffect, useContext } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { ValueAnimationControls } from "../animation/ValueAnimationControls"
import { MotionPluginContext } from "../motion/context/MotionPluginContext"
import { DraggableProps } from "./types"
import { ComponentDragControls } from "./ComponentDragControls"
import { useConstant } from "../utils/use-constant"
import { VisualElement } from "../dom/VisualElement"

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
export function useDrag(
    props: DraggableProps,
    visualElement: VisualElement,
    values: MotionValuesMap,
    controls: ValueAnimationControls
) {
    const { dragControls: groupDragControls } = props
    const { transformPagePoint } = useContext(MotionPluginContext)

    const dragControls = useConstant(
        () => new ComponentDragControls({ visualElement, values, controls })
    )
    dragControls.updateProps({ ...props, transformPagePoint })

    useEffect(
        () => groupDragControls && groupDragControls.subscribe(dragControls),
        [dragControls]
    )

    useEffect(() => dragControls.mount(visualElement.getInstance()), [])
}
