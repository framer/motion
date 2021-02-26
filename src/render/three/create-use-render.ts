import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"
import { isValidMotionProp } from "../../motion/utils/valid-prop"
import { useGestures } from "./gestures/use-gestures"
import { useConstant } from "../../utils/use-constant"
import { Object3DMotionProps } from "./types"

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

        const props = { ...latest }

        if (position) props.position = position
        if (rotation) props.rotation = rotation
        if (scale) props.scale = scale

        return props
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
