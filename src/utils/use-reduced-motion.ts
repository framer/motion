import { useEffect, useState, useContext } from "react"
import {
    prefersReducedMotion,
    determineShouldReduceMotion,
} from "../dom/accessibility"
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
 * export function Sidebar({ isOpem }) {
 *   const shouldReduceMotion = useReducedMotion()
 *   const closedX = shouldReduceMotion ? 0 : "-100%"
 *
 *   return (
 *     <motion.div animate={{
 *       opacity: isOpen ? 1 : 0,
 *       x: isOpen ? 0 : closedX
 *     }} />
 *   )
 * }
 * ```
 *
 * @return boolean
 */
export function useReducedMotion() {
    const { reducedMotion } = useContext(MotionContext)
    const [shouldReduceMotion, setShouldReduceMotion] = useState(
        determineShouldReduceMotion(prefersReducedMotion.get(), reducedMotion)
    )

    useEffect(
        () => {
            return prefersReducedMotion.onChange(() => {
                setShouldReduceMotion(
                    determineShouldReduceMotion(
                        prefersReducedMotion.get(),
                        reducedMotion
                    )
                )
            })
        },
        [setShouldReduceMotion, reducedMotion.force, reducedMotion.detect]
    )

    return shouldReduceMotion
}
