import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"
import { isValidMotionProp } from "../../motion/utils/valid-prop"
import { useGestures } from "./utils/use-gestures"
import * as Three from "three"
import * as ReactThreeFiber from "react-three-fiber"
import { useConstant } from "../../utils/use-constant"

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
            ...useVisualProps(visualElement),
            ...useGestures(props, visualElement),
            ref: visualElement.ref,
        } as any)
    }
    return useRender
}

function useVisualProps(visualElement: VisualElement) {
    const createVisualProps = () => {
        const { position, rotation, scale, latest } = visualElement.build()

        return {
            position,
            rotation,
            scale,
            ...latest,
        }
    }

    return visualElement.isStatic
        ? createVisualProps()
        : useConstant(createVisualProps)
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
