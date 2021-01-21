import {
    ComponentType,
    MutableRefObject,
    Ref,
    useContext,
    useEffect,
    useRef,
} from "react"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { isPresent } from "../../components/AnimatePresence/use-presence"
import { MotionProps } from "../../motion"
import { useVisualElementContext } from "../../motion/context/MotionContext"
import { useIsomorphicLayoutEffect } from "../../utils/use-isomorphic-effect"
import { VisualElement } from "../types"
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

    const visualElementRef: MutableRefObject<VisualElement | null> = useRef(
        null
    )

    if (isStatic && visualElementRef.current) {
        visualElementRef.current.clearState(props)
    }

    if (!visualElementRef.current) {
        // TODO: I believe this is the only DOM-specific line here, change useVisualElement to getVisualElementFactory
        const factory = isSVGComponent(Component)
            ? svgVisualElement
            : htmlVisualElement

        visualElementRef.current = factory(
            {
                parent,
                ref: ref as any,
                isStatic,
                props,
                blockInitialAnimation: presenceContext?.initial === false,
            },
            { enableHardwareAcceleration: !isStatic }
        )
    }

    const visualElement = visualElementRef.current

    if (visualElement.isStatic) return visualElement

    useIsomorphicLayoutEffect(() => {
        visualElement.updateProps(props)

        /**
         * What we want here is to clear the order of variant children in useLayoutEffect
         * then children can re-add themselves in useEffect. This should add them in the intended order
         * for staggerChildren to work correctly.
         */
        isPresent(presenceContext) && visualElement.variantChildren?.clear()

        // TODO: Fire visualElement layout listeners

        visualElement.syncRender()
    })

    useEffect(() => {
        visualElement.subscribeToVariantParent()

        // TODO: visualElement aalready has props, we can do better here
        visualElement.animationState?.setProps(props)

        // TODO: Fire visualElement effect listeners
    })

    return visualElement
}
