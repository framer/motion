import {
    ValueAnimationControls,
    ValueAnimationConfig,
} from "./ValueAnimationControls"
import { useContext, useEffect } from "react"
import { MotionProps } from "../motion/types"
import {
    MotionContext,
    MotionContextProps,
} from "../motion/context/MotionContext"
import { useConstant } from "../utils/use-constant"

/**
 * Creates an imperative set of controls to trigger animations.
 *
 * This allows a consolidated, uniform API for animations, to be triggered by other APIs like the `animate` prop, or the gesture handlers.
 *
 * @param values
 * @param props
 * @param ref
 * @param subscribeToParentControls
 *
 * @internal
 */
export function useValueAnimationControls<P>(
    config: ValueAnimationConfig,
    props: P & MotionProps,
    subscribeToParentControls: boolean,
    parentContext?: MotionContextProps
) {
    const { variants, transition } = props
    const parentControls = useContext(MotionContext).controls
    const controls = useConstant(() => new ValueAnimationControls<P>(config))

    // Reset and resubscribe children every render to ensure stagger order is correct
    if (
        !parentContext ||
        !parentContext.exitProps ||
        !parentContext.exitProps.isExiting
    ) {
        controls.resetChildren()
        controls.setProps(props)
        controls.setVariants(variants)
        controls.setDefaultTransition(transition)
    }

    useEffect(() => {
        // todo ensure this fires before variant
        if (subscribeToParentControls && parentControls) {
            parentControls.addChild(controls)
        }
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
