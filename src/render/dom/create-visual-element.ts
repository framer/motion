import { ComponentType } from "react"
import { htmlVisualElement } from "../html/visual-element"
import { svgVisualElement } from "../svg/visual-element"
import { CreateVisualElement, VisualElementOptions } from "../types"
import { isSVGComponent } from "./utils/is-svg-component"

export const createDomVisualElement: CreateVisualElement<
    HTMLElement | SVGElement
> = (
    Component: string | ComponentType,
    options: VisualElementOptions<HTMLElement | SVGElement>
) =>
    isSVGComponent(Component)
        ? svgVisualElement(options)
        : htmlVisualElement(options)
