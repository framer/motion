import { useState, useContext, useCallback } from "react"
import { useValueAnimationControls } from "./use-value-animation-controls"
import { useMotionValues } from "../motion/utils/use-motion-values"
import { MotionContext } from "../motion"
import { AnimationDefinition } from "./ValueAnimationControls"

/**
 * Makes an animated version of useState.
 *
 * When the state setter is called, values will be animated to their new position.
 *
 * TODO:
 * - Make hook accept a version of TargetAndTransition that accepts any value (not just DOM values)
 *
 *
 * @beta
 */
export function useAnimationState(initialState: any) {
    const [animationState, onUpdate] = useState(initialState)
    const isStatic = useContext(MotionContext).static || false
    const values = useMotionValues({ onUpdate }, isStatic)
    const controls = useValueAnimationControls(
        { values, readValueFromSource: key => animationState[key] },
        {},
        false
    )

    const startAnimation = useCallback(
        (animationDefinition: AnimationDefinition) => {
            controls.start(animationDefinition)
        },
        []
    )

    return [animationState, startAnimation]
}
