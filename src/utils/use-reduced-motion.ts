import { useState } from "react"
import { motionValue, MotionValue } from "../value"
import { useOnChange } from "../value/use-on-change"

// Does this device prefer reduced motion? Returns `null` server-side.
let prefersReducedMotion: MotionValue<boolean | null>

function initPrefersReducedMotion() {
    prefersReducedMotion = motionValue(null)

    if (typeof window === "undefined") return

    if (window.matchMedia) {
        const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)")

        const setReducedMotionPreferences = () =>
            prefersReducedMotion.set(motionMediaQuery.matches)

        motionMediaQuery.addListener(setReducedMotionPreferences)

        setReducedMotionPreferences()
    } else {
        prefersReducedMotion.set(false)
    }
}

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
    !prefersReducedMotion && initPrefersReducedMotion()

    const [shouldReduceMotion, setShouldReduceMotion] = useState(
        prefersReducedMotion.get()
    )

    useOnChange(prefersReducedMotion, setShouldReduceMotion)

    return shouldReduceMotion
}
