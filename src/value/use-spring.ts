import { useRef, useMemo } from "react"
import { animate, PlaybackControls, SpringOptions } from "popmotion"
import { MotionValue } from "../value"
import { isMotionValue } from "./utils/is-motion-value"
import { useMotionValue } from "./use-motion-value"
import { useOnChange } from "./use-on-change"

/**
 * Creates a `MotionValue` that, when `set`, will use a spring animation to animate to its new state.
 *
 * It can either work as a stand-alone `MotionValue` by initialising it with a value, or as a subscriber
 * to another `MotionValue`.
 *
 * @remarks
 *
 * ```jsx
 * const x = useSpring(0, { stiffness: 300 })
 * const y = useSpring(x, { damping: 10 })
 * ```
 *
 * @param inputValue - `MotionValue` or number. If provided a `MotionValue`, when the input `MotionValue` changes, the created `MotionValue` will spring towards that value.
 * @param springConfig - Configuration options for the spring.
 * @returns `MotionValue`
 *
 * @public
 */
export function useSpring(
    source: MotionValue | number,
    config: SpringOptions = {}
) {
    const activeSpringAnimation = useRef<PlaybackControls | null>(null)
    const value = useMotionValue(isMotionValue(source) ? source.get() : source)

    useMemo(() => {
        return value.attach((v, set) => {
            if (activeSpringAnimation.current) {
                activeSpringAnimation.current.stop()
            }

            activeSpringAnimation.current = animate({
                from: value.get(),
                to: v,
                velocity: value.getVelocity(),
                ...config,
                onUpdate: set,
            })

            return value.get()
        })
    }, Object.values(config))

    useOnChange(source, v => value.set(parseFloat(v)))

    return value
}
