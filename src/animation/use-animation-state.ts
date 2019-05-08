import { useState, useCallback, useMemo, useEffect } from "react"
import { useValueAnimationControls } from "./use-value-animation-controls"
import { useMotionValues } from "../motion/utils/use-motion-values"
import { AnimationDefinition } from "./ValueAnimationControls"

/**
 * Makes an animated version of `useState`.
 *
 * When the returned state setter is called, values will be animated to their new target.
 *
 * This allows the animation of arbitrary React components.
 *
 * **Note:** When animating DOM components, it's always preferable to use the `animate` prop, as Framer
 * will bypass React's rendering. This Hook is specifically for animating props on arbitrary React components,
 * or for animating text content.
 *
 * ```jsx
 * const [state, setState] = useAnimationState({ percentage: 0 })
 *
 * return (
 *   <Graph
 *     percentage={state.percentage}
 *     onTap={() => setState({ percentage: 50 })}
 *   />
 * )
 * ```
 *
 * TODO:
 * - Make hook accept a typed version of Target that accepts any value (not just DOM values)
 * - Allow hook to accept single values. ie useAnimationState(0)
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
