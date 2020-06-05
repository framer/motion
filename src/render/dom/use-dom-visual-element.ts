import { Ref } from "react"
import { HTMLVisualElement } from "./HTMLVisualElement"
import { useConstant } from "../../utils/use-constant"
import { MotionProps } from "../../motion/types"

export function useVisualElement<E = any>(
    props: MotionProps,
    parent?: HTMLVisualElement,
    isStatic: boolean = false,
    ref?: Ref<E>
) {
    const visualElement = useConstant(
        () => new HTMLVisualElement(parent, ref as any)
    )

    visualElement.updateConfig({
        allowTransformNone: props.allowTransformNone,
        enableHardwareAcceleration: !isStatic,
        transformTemplate: props.transformTemplate,
        onUpdate: props.onUpdate,
    })

    return visualElement
}
