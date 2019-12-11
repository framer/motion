import { motionValue } from "../value"

interface ReducedMotionOptions {
    /**
     * Control whether to detect the device's Reduce Motion setting.
     * @internal
     */
    detect: boolean

    /**
     * Whether to force reduce motion mode.
     * @internal
     */
    force: boolean
}

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

export function determineShouldReduceMotion(
    prefersReduced: boolean | null,
    { detect, force }: ReducedMotionOptions
): boolean {
    return force ? true : detect && Boolean(prefersReduced)
}
