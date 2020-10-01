import { HTMLVisualElement } from "./HTMLVisualElement"
import { useConstant } from "../../utils/use-constant"
import { MotionProps } from "../../motion/types"
import { SVGVisualElement } from "./SVGVisualElement"
import { UseVisualElement } from "../types"
import { isSVGComponent } from "./utils/is-svg-component"
import { useIsPresent } from "../../components/AnimatePresence/use-presence"
import { useContext, useEffect } from "react"
import { VisualElementContext } from "../../motion/context/VisualElementContext"
import { useUnmountEffect } from "../../utils/use-unmount-effect"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"

/**
 * DOM-flavoured variation of the useVisualElement hook. Used to create either a HTMLVisualElement
 * or SVGVisualElement for the component.
 *
 */
export const useDomVisualElement: UseVisualElement<MotionProps, any> = (
    Component,
    props,
    isStatic,
    ref
) => {
    const parent = useContext(VisualElementContext)

    const visualElement = useConstant(() => {
        const DOMVisualElement = isSVGComponent(Component)
            ? SVGVisualElement
            : HTMLVisualElement

        return new DOMVisualElement(parent, ref as any)
    })

    visualElement.updateConfig({
        ...visualElement.config,
        enableHardwareAcceleration: !isStatic,
        ...props,
    })

    visualElement.layoutId = props.layoutId

    const presenceContext = useContext(PresenceContext)

    /**
     * Update VisualElement with
     */
    const isPresent =
        presenceContext === null ? true : presenceContext.isPresent
    visualElement.isPresent =
        props.isPresent !== undefined ? props.isPresent : isPresent

    /**
     *
     */
    const presenceId = presenceContext?.id
    visualElement.isPresenceRoot = parent.presenceId !== presenceId

    /**
     * If this component is present, reset and resubscribe its variant children to
     * ensure a correct stagger order.
     */
    isPresent && visualElement.clearVariantChildren()

    /**
     * After every render, resubscribe this component to incoming variants from the parent.
     */
    useEffect(() => {
        if (parent && shouldInheritVariant)
            parent.subscribeToVariant(visualElement)
    })

    /**
     * TODO: Investigate if we need this
     */
    useEffect(() => {
        if (props.onViewportBoxUpdate) {
            return visualElement.onViewportBoxUpdate(props.onViewportBoxUpdate)
        }
    }, [props.onViewportBoxUpdate])

    /**
     * Track mount status so children can detect whether they were present during the
     * component's initial mount.
     */
    useEffect(() => {
        visualElement.isMounted = true
        return () => (visualElement.isMounted = false)
    }, [])

    return visualElement
}
