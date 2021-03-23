import { VisualElement } from "../types"

export const sortByDepth = (a: VisualElement, b: VisualElement) =>
    a.depth - b.depth
