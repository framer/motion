import { visualElement } from ".."
import { DOMVisualElementOptions } from "./types"

export function htmlVisualElement(options: DOMVisualElementOptions) {
    const element = visualElement(options)

    return element
}
