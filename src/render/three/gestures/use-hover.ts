import { MeshProps, ThreeEvent } from "@react-three/fiber"
import { VisualElement } from "../../types"
import { AnimationType } from "../../utils/types"
import { ThreeMotionProps } from "../types"

export function useHover(
    isStatic: boolean,
    {
        whileHover,
        onHoverStart,
        onHoverEnd,
        onPointerOver,
        onPointerOut,
    }: ThreeMotionProps & MeshProps,
    visualElement?: VisualElement
) {
    const isHoverEnabled = whileHover || onHoverStart || onHoverEnd

    if (isStatic || !visualElement || !isHoverEnabled) return {}

    return {
        onPointerOver: (event: ThreeEvent<any>) => {
            visualElement.animationState?.setActive(AnimationType.Hover, true)
            onPointerOver?.(event)
        },
        onPointerOut: (event: ThreeEvent<any>) => {
            visualElement.animationState?.setActive(AnimationType.Hover, false)
            onPointerOut?.(event)
        },
    }
}
