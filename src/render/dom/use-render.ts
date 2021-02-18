import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { VisualElement } from "../types"
import { useHTMLProps } from "./utils/use-html-props"
import { filterProps } from "./utils/filter-props"
import { isSVGComponent } from "./utils/is-svg-component"
import { useSVGProps } from "./utils/use-svg-props"

export function useRender<Props>(
    Component: string | React.ComponentType<Props>,
    props: MotionProps,
    visualElement: VisualElement
) {
    // Only filter props from components we control, ie `motion.div`. If this
    // is a custom component pass along everything provided to it.
    const forwardedProps =
        typeof Component === "string" ? filterProps(props) : props

    // Generate props to visually render this component
    const useProps = isSVGComponent(Component) ? useSVGProps : useHTMLProps
    const visualProps = useProps(visualElement, props)

    return createElement<any>(Component, {
        ...forwardedProps,
        ref: visualElement.ref,
        ...visualProps,
    })
}
