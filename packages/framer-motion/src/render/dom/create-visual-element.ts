import { ComponentType } from "react"
import { HTMLVisualElement } from "../html/HTMLVisualElement"
import { SVGVisualElement } from "../svg/SVGVisualElement"
import { CreateVisualElement, VisualElementOptions } from "../types"
import { isSVGComponent } from "./utils/is-svg-component"

export const createDomVisualElement: CreateVisualElement<
    HTMLElement | SVGElement
> = (
    Component: string | ComponentType<React.PropsWithChildren<unknown>>,
    options: VisualElementOptions<HTMLElement | SVGElement>
) => {
    return isSVGComponent(Component)
        ? new SVGVisualElement(options, { enableHardwareAcceleration: false })
        : new HTMLVisualElement(options, { enableHardwareAcceleration: true })
}
