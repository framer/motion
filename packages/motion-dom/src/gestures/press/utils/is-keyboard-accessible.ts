const focusableElements = new Set([
    "BUTTON",
    "INPUT",
    "SELECT",
    "TEXTAREA",
    "A",
])

export function isElementKeyboardAccessible(element: HTMLElement) {
    return focusableElements.has(element.tagName) || element.tabIndex !== -1
}
