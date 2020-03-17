export const isSVGElement = (node: Element): node is SVGElement =>
    node instanceof SVGElement || "ownerSVGElement" in node
