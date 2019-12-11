import { useEffect, useState, useContext } from "react"
import { prefersReducedMotion, shouldReduceMotion } from "../dom/accessibility"
import { MotionContext } from "../motion/context/MotionContext"

/**
 * A hook that returns `true` if we should be using reduced motion based on the current device's Reduced Motion setting.
 *
 * This can be used to implement changes to your UI based on Reduced Motion. For instance, replacing motion-sickness inducing
 * `x`/`y` animations with `opacity, disabling the autoplay of background videos, or turning off parallax motion.
 *
 * It will actively respond to changes and re-render your components with the latest setting.
 *
 * ```jsx
 * export function MyComponent() {
 *   const isReducedMotion = useReducedMotion()
 *
 *   return <video autoplay={!isReducedMotion} />
 * }
 * ```
 *
 * @return boolean
 */
export function useReducedMotion() {
    const { reducedMotion } = useContext(MotionContext)
    const [isReducedMotion, setIsReducedMotion] = useState(
        shouldReduceMotion(prefersReducedMotion.get(), reducedMotion)
    )

    useEffect(
        () => {
            return prefersReducedMotion.onChange(() => {
                setIsReducedMotion(
                    shouldReduceMotion(
                        prefersReducedMotion.get(),
                        reducedMotion
                    )
                )
            })
        },
        [setIsReducedMotion, reducedMotion.force, reducedMotion.detect]
    )

    return isReducedMotion
}
