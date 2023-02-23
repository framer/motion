export type ElementOrSelector =
    | Element
    | Element[]
    | NodeListOf<Element>
    | string

export function resolveElements(
    elements: ElementOrSelector,
    selectorCache?: { [key: string]: NodeListOf<Element> }
): Element[] {
    if (typeof elements === "string") {
        if (selectorCache) {
            selectorCache[elements] ??= document.querySelectorAll(elements)
            elements = selectorCache[elements]
        } else {
            elements = document.querySelectorAll(elements)
        }
    } else if (elements instanceof Element) {
        elements = [elements]
    }

    /**
     * Return an empty array
     */
    return Array.from(elements || [])
}
