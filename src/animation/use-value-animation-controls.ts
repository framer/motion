import {
    ValueAnimationControls,
    ValueAnimationConfig,
} from "./ValueAnimationControls"
import { useContext, useEffect } from "react"
import { MotionProps } from "../motion/types"
import { MotionContext } from "../motion/context/MotionContext"
import { useConstant } from "../utils/use-constant"

/**
 * Creates an imperative set of controls to trigger animations.
 *
 * This allows a consolidated, uniform API for animations, to be triggered by other APIs like the `animate` prop, or the gesture handlers.
 *
 * @param values
 * @param props
 * @param ref
 * @param inheritVariantChanges
 *
 * @internal
 */
export function useValueAnimationControls<P>(
    config: ValueAnimationConfig,
    props: P & MotionProps,
    inheritVariantChanges: boolean
) {
    const { variants, transition } = props
    const parentControls = useContext(MotionContext).controls
    const controls = useConstant(() => new ValueAnimationControls<P>(config))

    // Reset and resubscribe children every render to ensure stagger order is correct
    controls.resetChildren()
    controls.setProps(props)
    controls.setVariants(variants)
    controls.setDefaultTransition(transition)

    if (inheritVariantChanges && parentControls) {
        parentControls.addChild(controls)
    }

    useEffect(
        () => () => parentControls && parentControls.removeChild(controls),
        []
    )

    return controls
}
