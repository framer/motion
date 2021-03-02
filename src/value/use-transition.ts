import { useEffect } from "react"
import { MotionValue } from "../value"
import { useMotionValue } from "./use-motion-value"
import { animate, AnimationOptions } from "../animation/animate"
import { isMotionValue } from "./utils/is-motion-value"

/**
 * Creates a `MotionValue` that, when `set` on the source, will use a transition animation to animate to its new state.
 *
 * @remarks
 *
 * ```jsx
 * const x = useMotionValue(0)
 * const y = useTransition(x, { duration: 2 })
 *
 * x.set(100) // Animates y
 * ```
 *
 * @param source - `MotionValue`. When the input `MotionValue` changes, the created `MotionValue` will transition towards that value.
 * @param transitionConfig - Configuration options for the transition.
 * @returns `MotionValue`
 *
 * @public
 */
export function useTransition<T = number>(
    source: MotionValue<T>,
    config: AnimationOptions<T> = {}
) {
    const animatedMotionValue = useMotionValue<T>(
        isMotionValue(source) ? source.get() : source
    )

    useEffect(() => {
        let animation: undefined | ReturnType<typeof animate>

        return source.onChange((newValue: T) => {
            animation?.stop() // Don't know if this is needed
            animation = animate<T>(animatedMotionValue, newValue, config)
        })
    }, [animatedMotionValue, config, source])

    return animatedMotionValue
}
