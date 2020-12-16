import { HTMLVisualElement } from "./HTMLVisualElement"
import { useConstant } from "../../utils/use-constant"
import { MotionProps } from "../../motion/types"
import { SVGVisualElement } from "./SVGVisualElement"
import { UseVisualElement } from "../VisualElement/types"
import { isSVGComponent } from "./utils/is-svg-component"
import { useContext, useEffect } from "react"
import { PresenceContext } from "../../components/AnimatePresence/PresenceContext"
import { useVisualElementContext } from "../../motion/context/MotionContext"
import { LayoutGroupContext } from "../../components/AnimateSharedLayout/LayoutGroupContext"

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
    const parent = useVisualElementContext()

    const visualElement = useConstant(() => {
        const DOMVisualElement = isSVGComponent(Component)
            ? SVGVisualElement
            : HTMLVisualElement

        return new DOMVisualElement(parent, ref as any)
    })

    /**
     * If this is a static component, for instance on the Framer canvas, we essentially want to
     * treat it as a new component every render.
     * TODO: This shouldn't live in a DOM-specific hook but there'll be a better sense of where this
     * and much of this hook should live when creating a new type of VisualElement (e.g Three.js).
     */
    if (isStatic) {
        visualElement.values.clear()
        visualElement.latest = {}
    }

    visualElement.updateConfig({
        ...visualElement.config,
        enableHardwareAcceleration: !isStatic,
        ...props,
    })

    const layoutGroupId = useContext(LayoutGroupContext)
    visualElement.layoutId =
        layoutGroupId && props.layoutId
            ? `${layoutGroupId}-${props.layoutId}`
            : props.layoutId

    const presenceContext = useContext(PresenceContext)

    /**
     * Update VisualElement with presence data.
     */
    const isPresent =
        presenceContext === null ? true : presenceContext.isPresent
    visualElement.isPresent =
        props.isPresent !== undefined ? props.isPresent : isPresent

    /**
     *
     */
    const presenceId = presenceContext?.id
    visualElement.isPresenceRoot = !parent || parent.presenceId !== presenceId

    /**
     * TODO: Investigate if we need this
     */
    useEffect(() => {
        if (props.onViewportBoxUpdate) {
            return visualElement.onViewportBoxUpdate(props.onViewportBoxUpdate)
        }
    }, [props.onViewportBoxUpdate])

    return visualElement
}
