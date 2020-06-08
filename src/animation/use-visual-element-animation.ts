import {
    VisualElementAnimationControls,
    AnimationControlsConfig,
} from "./VisualElementAnimationControls"
import { useContext, useEffect } from "react"
import { MotionProps } from "../motion/types"
import { MotionContext } from "../motion/context/MotionContext"
import { useConstant } from "../utils/use-constant"
import { PresenceContext } from "../components/AnimatePresence/PresenceContext"
import { VisualElement } from "../render/VisualElement"
import { checkShouldInheritVariant } from "../motion/utils/should-inherit-variant"

/**
 * Creates an imperative set of controls to trigger animations.
 *
 * This allows a consolidated, uniform API for animations, to be triggered by other APIs like the `animate` prop, or the gesture handlers.
 *
 * @internal
 */
export function useVisualElementAnimation<P>(
    visualElement: VisualElement,
    props: P & MotionProps,
    config: AnimationControlsConfig
) {
    const subscribeToParentControls = checkShouldInheritVariant(props)
    const { variants, transition } = props
    const parentControls = useContext(MotionContext).controls
    const presenceContext = useContext(PresenceContext)
    const controls = useConstant(
        () => new VisualElementAnimationControls<P>(visualElement, config)
    )

    // Reset and resubscribe children every render to ensure stagger order is correct
    if (!presenceContext || presenceContext.isPresent) {
        controls.resetChildren()
        controls.setProps(props)
        controls.setVariants(variants)
        controls.setDefaultTransition(transition)
    }

    // We have to subscribe to the parent controls within a useEffect rather than during render,
    // as
    useEffect(() => {
        if (subscribeToParentControls && parentControls) {
            parentControls.addChild(controls)
        }
    })

    useEffect(() => {
        return () => {
            // Remove reference to onAnimationComplete from controls. All the MotionValues
            // are unsubscribed from this component separately. We let animations run out
            // as they might be animating other components.
            const { onAnimationComplete, ...unmountProps } = props
            controls.setProps(unmountProps as P & MotionProps)

            parentControls && parentControls.removeChild(controls)
        }
    }, [])

    return controls
}
