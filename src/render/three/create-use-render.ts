import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"

export function createThreeUseRender<Props>(
    Component: string | React.ComponentType<Props>,
    _forwardMotionProps = false
) {
    const useRender = (_props: MotionProps, _visualElement: VisualElement) => {
        return createElement(Component)
    }
    return useRender
}
