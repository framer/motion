import { ComponentType, Ref, useContext, useEffect } from "react"
import { LayoutGroupContext } from "../../../components/AnimateSharedLayout/LayoutGroupContext"
import { MotionProps } from "../../../motion"
import { useVisualElementContext } from "../../../motion/context/MotionContext"
import { useConstant } from "../../../utils/use-constant"
import { useUnmountEffect } from "../../../utils/use-unmount-effect"
import { htmlVisualElement } from "./html-visual-element"
import { svgVisualElement } from "./svg-visual-element"
import { isSVGComponent } from "./utils/is-svg-component"

export function useDomVisualElement<E>(
    Component: string | ComponentType,
    { layoutId }: MotionProps,
    isStatic: boolean,
    ref: Ref<E>
) {
    const parent = useVisualElementContext()
    const layoutGroupId = useContext(LayoutGroupContext)

    const visualElement = useConstant(() => {
        // TODO: I believe this is the only DOM-specific line here, change useVisualElement to getVisualElementFactory
        const factory = isSVGComponent(Component)
            ? svgVisualElement
            : htmlVisualElement

        const projectionId =
            layoutGroupId && layoutId
                ? layoutGroupId + "-" + layoutId
                : layoutId

        return factory({
            projectionId,
            enableHardwareAcceleration: !isStatic,
            parent,
            ref,
        })
    })

    useEffect(() => {
        // update settings

        return
    })

    useUnmountEffect(() => visualElement.destroy())

    return visualElement
}
