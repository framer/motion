import { useContext, useState } from "react"
import { MotionConfigContext } from "../context/MotionConfigContext"

interface ReducedMotionState {
    current: boolean | null
}

// Does this device prefer reduced motion? Returns `null` server-side.
const prefersReducedMotion: ReducedMotionState = { current: null }

let hasDetected = false
function initPrefersReducedMotion() {
    hasDetected = true
    if (typeof window === "undefined") return

    if (window.matchMedia) {
        const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)")

        const setReducedMotionPreferences = () =>
            (prefersReducedMotion.current = motionMediaQuery.matches)

        motionMediaQuery.addListener(setReducedMotionPreferences)

        setReducedMotionPreferences()
    } else {
        prefersReducedMotion.current = false
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
    !hasDetected && initPrefersReducedMotion()

    const [shouldReduceMotion] = useState(prefersReducedMotion.current)

    /**
     * TODO See if people miss automatically updating shouldReduceMotion setting
     */

    return shouldReduceMotion
}

export function useReducedMotionConfig() {
    const reducedMotionPreference = useReducedMotion()
    const { reducedMotion } = useContext(MotionConfigContext)

    if (reducedMotion === "never") {
        return false
    } else if (reducedMotion === "always") {
        return true
    } else {
        return reducedMotionPreference
    }
}
