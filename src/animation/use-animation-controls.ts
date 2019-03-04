import { ComponentAnimationControls } from "./ComponentAnimationControls"
import { useContext, useMemo, useEffect, RefObject } from "react"
import { MotionValuesMap } from "../motion"
import { MotionProps } from "../motion/types"
import { MotionContext } from "../motion/context/MotionContext"
import { MotionPluginContext } from "../motion/context/MotionPluginContext"

/**
 * Creates an imperative set of controls to trigger animations.
 *
 * This allows a consolidated, uniform API for animations, to be triggered by other APIs like the `animate` prop, or the gesture handlers.
 *
 * @param values
 * @param props
 * @param ref
 * @param inherit
 *
 * @internal
 */
export function useComponentAnimationControls<P>(
    values: MotionValuesMap,
    props: P & MotionProps,
    ref: RefObject<Element>,
    inherit: boolean
) {
    const { variants, transition } = props
    const parentControls = useContext(MotionContext).controls
    const { customValues } = useContext(MotionPluginContext)
    const controls = useMemo(
        () => new ComponentAnimationControls<P>(values, ref, customValues),
        []
    )

    // Reset and resubscribe children every render to ensure stagger order is correct
    controls.resetChildren()

    if (inherit && parentControls) {
        parentControls.addChild(controls)
    }

    useEffect(
        () => () => parentControls && parentControls.removeChild(controls),
        []
    )

    controls.setProps(props)
    controls.setVariants(variants)
    controls.setDefaultTransition(transition)

    return controls
}
