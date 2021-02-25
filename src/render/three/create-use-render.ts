import { createElement, useCallback } from "react"
import * as Three from "three"
import * as ReactThreeFiber from "react-three-fiber"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"
import { AnimationType } from "../utils/animation-state"

export function createThreeUseRender<Props>(
    Component: string | React.ComponentType<Props>,
    _forwardMotionProps = false
) {
    const useRender = (props: MotionProps, visualElement: VisualElement) => {
        const hoverProps = useHoverGesture(props, visualElement)

        return createElement(Component, {
            ...props,
            ...hoverProps,
            ref: visualElement.ref,
        } as any)
    }
    return useRender
}

function useHoverGesture(
    { whileHover }: MotionProps,
    visualElement: VisualElement
): Partial<
    ReactThreeFiber.Object3DNode<
        Three.AudioListener,
        typeof Three.AudioListener
    >
> {
    const onPointerOver = useCallback(() => {
        visualElement.animationState?.setActive(AnimationType.Hover, true)
    }, [visualElement])

    const onPointerOut = useCallback(() => {
        visualElement.animationState?.setActive(AnimationType.Hover, false)
    }, [visualElement])

    return whileHover ? { onPointerOver, onPointerOut } : {}
}
