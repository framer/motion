import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { HTMLVisualElement } from "./HTMLVisualElement"
import { filterProps } from "./utils/filter-props"
import { buildHTMLProps } from "./utils/build-html-props"
import { buildSVGProps } from "./utils/build-svg-attrs"
import { SVGVisualElement } from "./SVGVisualElement"
import { isSVGComponent } from "./utils/is-svg-component"

export function render<Props>(
    Component: string | React.ComponentType<Props>,
    props: MotionProps,
    visualElement: HTMLVisualElement | SVGVisualElement
) {
    // Only filter props from components we control, ie `motion.div`. If this
    // is a custom component pass along everything provided to it.
    const forwardedProps =
        typeof Component === "string" ? filterProps(props) : props

    // Generate props to visually render this component
    const visualProps = isSVGComponent(Component)
        ? buildSVGProps(visualElement as SVGVisualElement)
        : buildHTMLProps(visualElement as HTMLVisualElement, props)

    return createElement<any>(Component, {
        ...forwardedProps,
        ref: visualElement.ref,
        ...visualProps,
    })
}
