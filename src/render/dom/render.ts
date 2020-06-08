import { createElement } from "react"
import { MotionProps } from "../../motion/types"
import { HTMLVisualElement } from "./HTMLVisualElement"
import { filterProps } from "./utils/filter-props"
import { buildHTMLProps } from "./utils/build-html-props"
import { buildSVGProps } from "./utils/build-svg-attrs"
import { SVGVisualElement } from "./SVGVisualElement"
import { svgElements } from "./utils/supported-elements"

const svgTagNames = new Set(svgElements)

export function render<Props>(
    Component: string | React.ComponentType<Props>,
    props: MotionProps,
    visualElement: HTMLVisualElement | SVGVisualElement
) {
    const isDOM = typeof Component === "string"
    const forwardedProps = isDOM ? filterProps(props) : props
    const visualProps =
        isDOM && isSVG(Component as string)
            ? buildSVGProps(visualElement as SVGVisualElement)
            : buildHTMLProps(visualElement as HTMLVisualElement, props)

    return createElement<any>(Component, {
        ...forwardedProps,
        ref: visualElement.ref,
        ...visualProps,
    })
}

function isSVG(Component: string) {
    return svgTagNames.has(Component as any)
}
