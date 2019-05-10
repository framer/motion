import { useState, useCallback, useEffect } from "react"
import { useValueAnimationControls } from "./use-value-animation-controls"
import { useMotionValues } from "../motion/utils/use-motion-values"
import { AnimationDefinition } from "./ValueAnimationControls"
import { useConstant } from "../utils/use-constant"

/**
 * Makes an animated version of `useState`.
 *
 * @remarks
 *
 * When the returned state setter is called, values will be animated to their new target.
 *
 * This allows the animation of arbitrary React components.
 *
 * **Note:** When animating DOM components, it's always preferable to use the `animate` prop, as Framer
 * will bypass React's rendering cycle with one optimised for 60fps motion. This Hook is specifically
 * for animating props on arbitrary React components, or for animating text content.
 *
 * ```jsx
 * const [state, setState] = useAnimatedState({ percentage: 0 })
 *
 * return (
 *   <Graph
 *     percentage={state.percentage}
 *     onTap={() => setState({ percentage: 50 })}
 *   />
 * )
 * ```
 *
 * @internalremarks
 *
 * TODO:
 * - Make hook accept a typed version of Target that accepts any value (not just DOM values)
 * - Allow hook to accept single values. ie useAnimatedState(0)
 * - Allow providing MotionValues via initialState.
 *
 * @beta
 */
export function useAnimatedState(initialState: any) {
    const [animationState, onUpdate] = useState(initialState)
    const config = useConstant(() => ({ onUpdate }))
    const values = useMotionValues(config)
    const controls = useValueAnimationControls(
        {
            values,
            readValueFromSource: key => animationState[key],
        },
        {},
        false
    )

    const startAnimation = useConstant(
        () => (animationDefinition: AnimationDefinition) => {
            return controls.start(animationDefinition)
        }
    )

    useEffect(() => {
        values.mount()
        return () => values.unmount()
    })

    return [animationState, startAnimation]
}
