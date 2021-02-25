import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"

export function createThreeUseRender<Props>(
    Component: string | React.ComponentType<Props>,
    _forwardMotionProps = false
) {
    const useRender = (props: MotionProps, visualElement: VisualElement) => {
        return createElement(Component, {
            ...props,
            ref: visualElement.ref,
        } as any)
    }
    return useRender
}
