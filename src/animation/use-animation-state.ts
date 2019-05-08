import { useState, useCallback, useMemo, useEffect } from "react"
import { useValueAnimationControls } from "./use-value-animation-controls"
import { useMotionValues } from "../motion/utils/use-motion-values"
import { AnimationDefinition } from "./ValueAnimationControls"

/**
 * Makes an animated version of useState.
 *
 * When the state setter is called, values will be animated to their new position.
 *
 * Using this hook will force a React re-render every frame. This allows greater
 * flexibility at the cost of performance.
 *
 * TODO:
 * - Make hook accept a version of Target that accepts any value (not just DOM values)
 * - Allow hook to accept single values.
 * - Allow providing MotionValues via initialState.
 *
 * @beta
 */
export function useAnimationState(initialState: any) {
    const [animationState, onUpdate] = useState(initialState)
    const config = useMemo(() => ({ onUpdate }), [])
    const values = useMotionValues(config)
    const controls = useValueAnimationControls(
        {
            values,
            readValueFromSource: key => animationState[key],
        },
        {},
        false
    )

    const startAnimation = useCallback(
        (animationDefinition: AnimationDefinition) => {
            return controls.start(animationDefinition)
        },
        []
    )

    useEffect(() => {
        values.mount()
        return () => values.unmount()
    })

    return [animationState, startAnimation]
}
