import { ComponentType } from "react"
import { VisualElementOptions } from "../types"
import { htmlVisualElement } from "./html-visual-element"
import { svgVisualElement } from "./svg-visual-element"
import { isSVGComponent } from "./utils/is-svg-component"

export function createDomVisualElement(Component: string | ComponentType) {
    return (
        isStatic: boolean,
        options:
            | VisualElementOptions<SVGElement>
            | VisualElementOptions<HTMLElement>
    ) => {
        const isSVG = isSVGComponent(Component)
        const factory = isSVG ? svgVisualElement : htmlVisualElement

        return factory(options as VisualElementOptions<any>, {
            enableHardwareAcceleration: !isStatic && !isSVG,
        })
    }
}
