import { useRef, useContext, useInsertionEffect } from "react"
import { MotionValue } from "../value"
import { isMotionValue } from "./utils/is-motion-value"
import { useMotionValue } from "./use-motion-value"
import { MotionConfigContext } from "../context/MotionConfigContext"
import { SpringOptions } from "../animation/types"
import { useIsomorphicLayoutEffect } from "../utils/use-isomorphic-effect"
import { frame, frameData } from "../frameloop"
import {
    MainThreadAnimation,
    animateValue,
} from "../animation/animators/MainThreadAnimation"

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
    const activeSpringAnimation = useRef<MainThreadAnimation<number> | null>(
        null
    )
    const value = useMotionValue(isMotionValue(source) ? source.get() : source)

    const stopAnimation = () => {
        if (activeSpringAnimation.current) {
            activeSpringAnimation.current.stop()
        }
    }

    useInsertionEffect(() => {
        let latestValue: number
        let set: (v: number) => void

        const startAnimation = () => {
            /**
             * If the previous animation hasn't had the chance to even render a frame, render it now.
             */
            const animation = activeSpringAnimation.current
            if (animation && animation.time === 0) {
                animation.sample(frameData.delta)
            }

            stopAnimation()

            console.log("useSpring", value.getVelocity(), frameData.currentStep)

            activeSpringAnimation.current = animateValue({
                keyframes: [value.get(), latestValue],
                velocity: value.getVelocity(),
                type: "spring",
                restDelta: 0.001,
                restSpeed: 0.01,
                ...config,
                onUpdate: set,
            })
        }

        return value.attach((v, frameSet) => {
            /**
             * A more hollistic approach to this might be to use isStatic to fix VisualElement animations
             * at that level, but this will work for now
             */
            if (isStatic) return set(v)

            latestValue = v
            set = frameSet

            frame.update(startAnimation, true)

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
