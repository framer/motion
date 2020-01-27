import { RefObject, useEffect, useContext } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { ValueAnimationControls } from "../animation/ValueAnimationControls"
import { MotionPluginContext } from "../motion/context/MotionPluginContext"
import { DraggableProps } from "./types"
import { DragControls } from "./DragControls"
import { useConstant } from "../utils/use-constant"

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
    ref: RefObject<Element>,
    values: MotionValuesMap,
    controls: ValueAnimationControls
) {
    const { dragControls: groupDragControls } = props
    const { transformPagePoint } = useContext(MotionPluginContext)

    const dragControls = useConstant(
        () => new DragControls({ ref, values, controls })
    )
    dragControls.updateProps({ ...props, transformPagePoint })

    useEffect(
        () => groupDragControls && groupDragControls.subscribe(dragControls),
        [dragControls]
    )

    useEffect(() => dragControls.mount(ref.current as Element), [])
}
