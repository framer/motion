import { createElement } from "react"
import { svgElements } from "../../../motion/utils/supported-elements"
import { MotionProps } from "../../../motion/types"
import { MotionValuesMap } from "../../../motion/utils/use-motion-values"
import { filterProps } from "./filter-props"
import { buildHTMLProps } from "../build-props/html"
import { buildSVGProps } from "../build-props/svg"

const svgTagNames = new Set(svgElements)

export function renderDOM<Props>(
    Component: string | React.ComponentType<Props>,
    props: MotionProps,
    motionValues: MotionValuesMap,
    isStatic: boolean
) {
    const isDOM = typeof Component === "string"
    const isSVG = isDOM && svgTagNames.has(Component as any)
    const forwardedProps = isDOM ? filterProps(props) : props
    const latestMotionValues = resolveMotionValues(motionValues)
    const staticVisualStyles = isSVG
        ? buildSVGProps(latestMotionValues, props)
        : buildHTMLProps(latestMotionValues, props, !isStatic)

    return createElement<any>(Component, {
        ...forwardedProps,
        //ref: nativeElement.ref,
        ...staticVisualStyles,
    })
}

function resolveMotionValues(_motionValues: MotionValuesMap) {
    const resolvedValues = {}
    // motionValues.forEach((value, key) => (resolvedValues[key] = value.get()))
    return resolvedValues
}
