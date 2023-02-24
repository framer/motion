import type { VisualElement } from "framer-motion"
import type { ThreeMotionProps } from "../../types"
import { MeshProps, ThreeEvent } from "@react-three/fiber"

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
            visualElement.animationState?.setActive("whileHover", true)
            onPointerOver && onPointerOver(event)
        },
        onPointerOut: (event: ThreeEvent<any>) => {
            visualElement.animationState?.setActive("whileHover", false)
            onPointerOut && onPointerOut(event)
        },
    }
}
