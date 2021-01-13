import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { buildHTMLProps } from "../../new-render/visual-element/dom/utils/build-html-props"
import { buildSVGProps } from "../../new-render/visual-element/dom/utils/build-svg-props"
import { filterProps } from "../../new-render/visual-element/dom/utils/filter-props"
import { HTMLVisualElement } from "./HTMLVisualElement"
import { SVGVisualElement } from "./SVGVisualElement"
import { isSVGComponent } from "./utils/is-svg-component"

export function useRender<Props>(
    Component: string | React.ComponentType<Props>,
    props: MotionProps,
    visualElement: HTMLVisualElement | SVGVisualElement
) {
    // Only filter props from components we control, ie `motion.div`. If this
    // is a custom component pass along everything provided to it.
    const forwardedProps =
        typeof Component === "string" ? filterProps(props) : props

    /**
     * Every render, empty and rebuild the animated values to be applied to our Element.
     * During animation these data structures are used in a mutable fashion to reduce
     * garbage collection, but between renders we can flush them to remove values
     * that might have been taken out of the provided props.
     */
    visualElement.clean()
    visualElement.build()

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
