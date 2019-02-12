import { AnimationControls } from "./AnimationControls"
import { useContext, useMemo, useEffect, RefObject } from "react"
import { MotionValuesMap } from "../motion"
import { MotionProps } from "../motion/types"
import { MotionContext } from "../motion/context/MotionContext"

export const useAnimationControls = <P>(
    values: MotionValuesMap,
    props: P & MotionProps,
    ref: RefObject<Element>,
    inherit: boolean
) => {
    const { variants, transition } = props
    const parentControls = useContext(MotionContext).controls
    const controls = useMemo(() => new AnimationControls<P>(values, ref), [])

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
