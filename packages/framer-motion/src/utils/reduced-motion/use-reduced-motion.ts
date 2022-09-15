import { useEffect, useId, useState } from "react"
import { initPrefersReducedMotion } from "."
import {
    hasReducedMotionListener,
    prefersReducedMotion,
    reducedMotionListenerCallbacks,
} from "./state"

/**
 * A hook that returns `true` if we should be using reduced motion based on the current device's Reduced Motion setting.
 *
 * This can be used to implement changes to your UI based on Reduced Motion. For instance, replacing motion-sickness inducing
 * `x`/`y` animations with `opacity`, disabling the autoplay of background videos, or turning off parallax motion.
 *
 * It will actively respond to changes and re-render your components with the latest setting.
 *
 * ```jsx
 * export function Sidebar({ isOpen }) {
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
 *
 * @public
 */
export function useReducedMotion() {
    /**
     * Lazy initialisation of prefersReducedMotion
     */
    !hasReducedMotionListener.current && initPrefersReducedMotion()

    const id = useId()
    const [shouldReduceMotion, setShouldReduceMotion] = useState(
        prefersReducedMotion.current
    )

    useEffect(() => {
        reducedMotionListenerCallbacks.set(id, () => {
            setShouldReduceMotion(prefersReducedMotion.current)
        })

        return () => {
            reducedMotionListenerCallbacks.delete(id)
        }
    }, [setShouldReduceMotion, id])

    return shouldReduceMotion
}
