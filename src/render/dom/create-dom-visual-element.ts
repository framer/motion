import { ComponentType } from "react"
import { isSVGComponent } from "./utils/is-svg-component"
import { createSVGVisualElement } from "../svg/create-visual-element"
import { createHTMLVisualElement } from "../html/create-visual-element"

export function createDomVisualElement(Component: string | ComponentType) {
    return isSVGComponent(Component)
        ? createSVGVisualElement
        : createHTMLVisualElement
}
