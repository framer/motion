import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"
import { isValidMotionProp } from "../../motion/utils/valid-prop"
import { useGestures } from "./utils/use-gestures"

type Object3DProps = ReactThreeFiber.Object3DNode<
    Three.Object3D,
    typeof Three.Object3D
>

type Object3DMotionProps = Object3DProps & MotionProps

export function createThreeUseRender<Props>(
    Component: string | React.ComponentType<Props>,
    forwardMotionProps = false
) {
    const useRender = (
        props: Object3DMotionProps,
        visualElement: VisualElement
    ) => {
        return createElement(Component, {
            ...filterProps(props, forwardMotionProps),
            ...props,
            ...useGestures(props, visualElement),
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
