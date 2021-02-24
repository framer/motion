import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"
import { useHTMLProps } from "./utils/use-html-props"
import { filterProps } from "./utils/filter-props"
import { isSVGComponent } from "./utils/is-svg-component"
import { useSVGProps } from "./utils/use-svg-props"

export function createUseRender<Props>(
    Component: string | React.ComponentType<Props>,
    forwardMotionProps = false
) {
    const useRender = (props: MotionProps, visualElement: VisualElement) => {
        // Generate props to visually render this component
        const useProps = isSVGComponent(Component) ? useSVGProps : useHTMLProps
        const visualProps = useProps(visualElement, props)

        return createElement<any>(Component, {
            ...filterProps(
                props,
                typeof Component === "string",
                forwardMotionProps
            ),
            ref: visualElement.ref,
            ...visualProps,
        })
    }

    return useRender
}
