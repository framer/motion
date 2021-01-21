import { ComponentType, Ref, useContext, useEffect } from "react"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { isPresent } from "../../components/AnimatePresence/use-presence"
import { MotionProps } from "../../motion"
import { useVisualElementContext } from "../../motion/context/MotionContext"
import { useConstant } from "../../utils/use-constant"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { htmlVisualElement } from "./html-visual-element"
import { svgVisualElement } from "./svg-visual-element"
import { isSVGComponent } from "./utils/is-svg-component"

export function useDomVisualElement<E>(
    Component: string | ComponentType,
    props: MotionProps,
    isStatic: boolean,
    ref: Ref<E>
) {
    const parent = useVisualElementContext()
    const presenceContext = useContext(PresenceContext)

    // const layoutGroupId = useContext(LayoutGroupContext)

    // const projectionId =
    //     layoutGroupId && layoutId
    //         ? layoutGroupId + "-" + layoutId
    //         : layoutId

    const visualElement = useConstant(() => {
        // TODO: I believe this is the only DOM-specific line here, change useVisualElement to getVisualElementFactory
        const factory = isSVGComponent(Component)
            ? svgVisualElement
            : htmlVisualElement

        return factory(
            {
                parent,
                ref: ref as any,
                isStatic,
                props,
                blockInitialAnimation: presenceContext?.initial === false,
            },
            { enableHardwareAcceleration: !isStatic }
        )
    })

    useIsomorphicLayoutEffect(() => {
        visualElement.updateProps(props)

        /**
         * What we want here is to clear the order of variant children in useLayoutEffect
         * then children can re-add themselves in useEffect. This should add them in the intended order
         * for staggerChildren to work correctly.
         */
        isPresent(presenceContext) && visualElement.variantChildren?.clear()

        // TODO: Fire visualElement layout listeners
    })

    useEffect(() => {
        visualElement.subscribeToVariantParent()

        // TODO: visualElement aalready has props, we can do better here
        visualElement.animationState?.setProps(props)

        // TODO: Fire visualElement effect listeners
    })

    return visualElement
}
