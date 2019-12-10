import { motionValue } from "../value"

// Does this device prefer reduced motion? Returns `null` server-side.
export const prefersReducedMotion = motionValue<boolean | null>(null)

if (typeof window !== "undefined") {
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
