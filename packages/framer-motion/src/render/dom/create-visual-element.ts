import { HTMLVisualElement } from "../html/HTMLVisualElement"
import { SVGVisualElement } from "../svg/SVGVisualElement"
import { CreateVisualElement, VisualElementOptions } from "../types"

export const createDomVisualElement: CreateVisualElement<
    HTMLElement | SVGElement
> = (options: VisualElementOptions<HTMLElement | SVGElement>) => {
    return options.type === "svg"
        ? new SVGVisualElement(options, { enableHardwareAcceleration: false })
        : new HTMLVisualElement(options, { enableHardwareAcceleration: true })
}
