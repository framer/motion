export const isHTMLElement = (node: Element): node is HTMLElement =>
    node instanceof HTMLElement ||
    // Cross-origin safe check
    typeof (node as HTMLElement).click === "function"
