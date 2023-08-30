export function calcInset(element: Element, container: HTMLElement) {
    const inset = { x: 0, y: 0 }

    let current: Element | null = element
    while (current && current !== container) {
        if (current instanceof HTMLElement) {
            inset.x += current.offsetLeft
            inset.y += current.offsetTop
            current = current.offsetParent
        } else if (current.tagName === "svg") {
            const svgBoundingBox = current.getBoundingClientRect()
            current = current.parentElement!
            const parentBoundingBox = current.getBoundingClientRect()
            inset.x += svgBoundingBox.left - parentBoundingBox.left
            inset.y += svgBoundingBox.top - parentBoundingBox.top
        } else if (
            current instanceof SVGGraphicsElement &&
            "getBBox" in current
        ) {
            const { x, y } = current.getBBox()
            inset.x += x
            inset.y += y

            let svg: SVGElement | null = null
            let parent: SVGElement = current.parentNode as SVGElement
            while (!svg) {
                if (parent.tagName === "svg") {
                    svg = parent
                }
                parent = current.parentNode as SVGElement
            }
            current = svg
        }
    }

    return inset
}
