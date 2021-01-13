import { createElement } from "react"
import { MotionProps } from "../../../motion/types"
import { VisualElement } from "../types"
import { buildHTMLProps } from "./utils/build-html-props"
import { buildSVGProps } from "./utils/build-svg-props"
import { filterProps } from "./utils/filter-props"
import { isSVGComponent } from "./utils/is-svg-component"

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
    const visualProps = isSVGComponent(Component)
        ? buildSVGProps(visualElement)
        : buildHTMLProps(visualElement, props)

    return createElement<any>(Component, {
        ...forwardedProps,
        ref: visualElement.ref,
        ...visualProps,
    })
}
