import {VisualElement} from "../render/VisualElement";

export const getContextWindow = (element: VisualElement<Element>) => {
    const currentElement  = element.current;
    if(!currentElement) return null;

    return currentElement.ownerDocument.defaultView;
}
