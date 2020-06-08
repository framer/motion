import { Ref } from "react"
import { HTMLVisualElement } from "./HTMLVisualElement"
import { useConstant } from "../../utils/use-constant"
import { MotionProps } from "../../motion/types"

export function useDomVisualElement<E = any>(
    props: MotionProps,
    parent?: HTMLVisualElement,
    isStatic: boolean = false,
    ref?: Ref<E>
) {
    const visualElement = useConstant(
        () => new HTMLVisualElement(parent, ref as any)
    )

    visualElement.updateConfig({
        enableHardwareAcceleration: !isStatic,
        ...props,
    })

    return visualElement
}
