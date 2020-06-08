import { Ref } from "react"
import { HTMLVisualElement } from "./HTMLVisualElement"
import { useConstant } from "../../utils/use-constant"
import { MotionProps } from "../../motion/types"
import { SVGVisualElement } from "./SVGVisualElement"

export function useDomVisualElement<E = any>(
    props: MotionProps,
    parent?: HTMLVisualElement | SVGVisualElement,
    isStatic: boolean = false,
    ref?: Ref<E>
) {
    const visualElement = useConstant(() => {
        const isSVG = isStatic
        return isSVG
            ? new SVGVisualElement(parent as any, ref as any)
            : new HTMLVisualElement(parent as any, ref as any)
    })

    visualElement.updateConfig({
        enableHardwareAcceleration: !isStatic,
        ...props,
    })

    return visualElement
}
