import { HTMLVisualElement } from "./HTMLVisualElement"
import { useConstant } from "../../utils/use-constant"
import { MotionProps } from "../../motion/types"
import { SVGVisualElement } from "./SVGVisualElement"
import { UseVisualElement } from "../types"
import { isSVGComponent } from "./utils/is-svg-component"

/**
 * DOM-flavoured variation of the useVisualElement hook. Used to create either a HTMLVisualElement
 * or SVGVisualElement for the component.
 */
export const useDomVisualElement: UseVisualElement<MotionProps, any> = (
    Component,
    props,
    parent,
    isStatic,
    ref
) => {
    const visualElement = useConstant(() => {
        const DOMVisualElement = isSVGComponent(Component)
            ? SVGVisualElement
            : HTMLVisualElement

        return new DOMVisualElement(parent, ref as any)
    })

    visualElement.updateConfig({
        enableHardwareAcceleration: !isStatic,
        ...props,
    })

    return visualElement
}
