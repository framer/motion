import { createElement, useCallback } from "react"
import * as Three from "three"
import * as ReactThreeFiber from "react-three-fiber"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"
import { AnimationType } from "../utils/animation-state"
import { isValidMotionProp } from "../../motion/utils/valid-prop"

type Object3DProps = ReactThreeFiber.Object3DNode<
    Three.Object3D,
    typeof Three.Object3D
>

type Object3DMotionProps = Object3DProps & MotionProps

export function createThreeUseRender<Props>(
    Component: string | React.ComponentType<Props>,
    forwardMotionProps = false
) {
    const useRender = (props: MotionProps, visualElement: VisualElement) => {
        const hoverProps = useHoverGesture(props, visualElement)

        return createElement(Component, {
            ...filterProps(props, forwardMotionProps),
            ...hoverProps,
            ref: visualElement.ref,
        } as any)
    }
    return useRender
}

function shouldForward(key: string) {
    return !isValidMotionProp(key)
}

function filterProps(props: MotionProps, forwardMotionProps: boolean) {
    const filteredProps = {}

    for (const key in props) {
        if (
            shouldForward(key) ||
            (forwardMotionProps === true && isValidMotionProp(key))
        ) {
            filteredProps[key] = props[key]
        }
    }

    return filteredProps
}

function useHoverGesture(
    { whileHover }: MotionProps,
    visualElement: VisualElement
): Object3DMotionProps {
    const onPointerOver = useCallback(() => {
        visualElement.animationState?.setActive(AnimationType.Hover, true)
    }, [visualElement])

    const onPointerOut = useCallback(() => {
        visualElement.animationState?.setActive(AnimationType.Hover, false)
    }, [visualElement])

    return whileHover ? { onPointerOver, onPointerOut } : {}
}
