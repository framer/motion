import type { VisualElement } from "framer-motion"
import type { ThreeMotionProps } from "../../types"
import { EventHandlers, ThreeEvent } from "@react-three/fiber"

export function useHover(
    isStatic: boolean,
    {
        whileHover,
        onHoverStart,
        onHoverEnd,
        onPointerOver,
        onPointerOut,
    }: ThreeMotionProps & EventHandlers,
    visualElement?: VisualElement
) {
    const isHoverEnabled = whileHover || onHoverStart || onHoverEnd

    if (isStatic || !visualElement || !isHoverEnabled) return {}

    return {
        onPointerOver: (event: ThreeEvent<PointerEvent>) => {
            visualElement.animationState?.setActive("whileHover", true)
            onPointerOver && onPointerOver(event)
        },
        onPointerOut: (event: ThreeEvent<PointerEvent>) => {
            visualElement.animationState?.setActive("whileHover", false)
            onPointerOut && onPointerOut(event)
        },
    }
}
