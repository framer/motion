import { useEffect, useContext } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { VisualElementAnimationControls } from "../animation/VisualElementAnimationControls"
import { MotionPluginContext } from "../motion/context/MotionPluginContext"
import { DraggableProps } from "./types"
import { ComponentDragControls } from "./ComponentDragControls"
import { useConstant } from "../utils/use-constant"
import { NativeElement } from "../motion/utils/use-native-element"
import { usePresence } from "../components/AnimatePresence/use-presence"

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
    nativeElement: NativeElement<Element>,
    values: MotionValuesMap,
    controls: VisualElementAnimationControls
) {
    const { dragControls: groupDragControls } = props
    const { transformPagePoint } = useContext(MotionPluginContext)

    const dragControls = useConstant(
        () => new ComponentDragControls({ nativeElement, values, controls })
    )
    dragControls.updateProps({ ...props, transformPagePoint })

    useDisableDragOnExit(dragControls)

    useEffect(
        () => groupDragControls && groupDragControls.subscribe(dragControls),
        [dragControls]
    )

    useEffect(() => dragControls.mount(nativeElement.getInstance()), [])
}

function useDisableDragOnExit(dragControls: ComponentDragControls) {
    const [isPresent, safeToRemove] = usePresence()
    useEffect(() => {
        if (!isPresent && safeToRemove) {
            safeToRemove()
            dragControls.stopMotion()
        }
    }, [isPresent])
}
