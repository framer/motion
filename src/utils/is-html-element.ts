export function isHTMLElement(
    element?: Element | HTMLElement | null
): element is HTMLElement {
    return element instanceof HTMLElement
}
