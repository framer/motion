import { SVGVisualElement } from "../SVGVisualElement"

/**
 * Build React props for SVG elements
 */
export function buildSVGProps(visualElement: SVGVisualElement) {
    return {
        ...visualElement.attrs,
        style: { ...visualElement.reactStyle },
    }
}
