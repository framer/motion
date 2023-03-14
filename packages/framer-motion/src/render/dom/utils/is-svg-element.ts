export function isSVGElement(element: unknown): element is SVGElement {
    return element instanceof SVGElement && element.tagName !== "svg"
}
