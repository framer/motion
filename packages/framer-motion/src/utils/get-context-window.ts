import { VisualElement } from "../render/VisualElement"

// Fixes https://github.com/framer/motion/issues/2270
export const getContextWindow = ({ current }: VisualElement<Element>) => {
    return current ? current.ownerDocument.defaultView : null
}
