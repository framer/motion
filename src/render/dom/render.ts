import { createElement } from "react"
//import { svgElements } from "./utils/supported-elements"
import { MotionProps } from "../../motion/types"
import { HTMLVisualElement } from "./HTMLVisualElement"
import { filterProps } from "./utils/filter-props"
import { buildHTMLProps } from "./utils/build-html-props"

//const svgTagNames = new Set(svgElements)

export function render<Props>(
    Component: string | React.ComponentType<Props>,
    props: MotionProps,
    visualElement: HTMLVisualElement
) {
    const isDOM = typeof Component === "string"
    const forwardedProps = isDOM ? filterProps(props) : props
    const visualProps = buildHTMLProps(visualElement, props)

    // const staticVisualStyles = isSVG
    //     ? buildSVGProps(latestMotionValues, props)
    //     : buildHTMLProps(latestMotionValues, props, !isStatic)

    return createElement<any>(Component, {
        ...forwardedProps,
        ref: visualElement.ref,
        ...visualProps,
    })
}
