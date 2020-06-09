import { svgElements } from "./supported-elements"

const svgTagNames = new Set(svgElements)

/**
 * Determine whether this is a HTML or SVG component based on if the provided
 * Component is a string and a recognised SVG tag. A potentially better way to
 * do this would be to offer a `motion.customSVG` function and determine this
 * when we generate the `motion.circle` etc components.
 */
export function isSVGComponent<Props>(
    Component: string | React.ComponentType<Props>
) {
    return typeof Component === "string" && svgTagNames.has(Component as any)
}
