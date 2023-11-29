import { VisualElement } from "../render/VisualElement"

export const getContextWindow = ({ current }: VisualElement<Element>) => {
    return current ? current.ownerDocument.defaultView : null
}
