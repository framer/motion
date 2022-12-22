import { useRef, useContext, useInsertionEffect } from "react"
import { MotionValue } from "../value"
import { isMotionValue } from "./utils/is-motion-value"
import { useMotionValue } from "./use-motion-value"
import { MotionConfigContext } from "../context/MotionConfigContext"
import { PlaybackControls } from "../animation/legacy-popmotion/types"
import { animate } from "../animation/legacy-popmotion"
import { SpringOptions } from "../animation/types"
import { useIsomorphicLayoutEffect } from "../utils/use-isomorphic-effect"

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
    const { isStatic } = useContext(MotionConfigContext)
    const activeSpringAnimation = useRef<PlaybackControls | null>(null)
    const value = useMotionValue(isMotionValue(source) ? source.get() : source)

    const stopAnimation = () => {
        if (activeSpringAnimation.current) {
            activeSpringAnimation.current.stop()
        }
    }

    useInsertionEffect(() => {
        return value.attach((v, set) => {
            /**
             * A more hollistic approach to this might be to use isStatic to fix VisualElement animations
             * at that level, but this will work for now
             */
            if (isStatic) return set(v)

            stopAnimation()

            activeSpringAnimation.current = animate({
                keyframes: [value.get(), v],
                velocity: value.getVelocity(),
                type: "spring",
                ...config,
                onUpdate: set,
            })

            return value.get()
        }, stopAnimation)
    }, [JSON.stringify(config)])

    useIsomorphicLayoutEffect(() => {
        if (isMotionValue(source)) {
            return source.on("change", (v) => value.set(parseFloat(v)))
        }
    }, [value])

    return value
}
