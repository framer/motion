// TODO: Before exposing this, it might be worth making `prefersReducedMotion`
// a `MotionValue` with a selectively-exposed API, for instance `get` and `onChange`.

let prefersReducedMotion: boolean | null = null

if (typeof window !== "undefined") {
    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)")

    const setReducedMotionPreferences = () =>
        (prefersReducedMotion = motionMediaQuery.matches)

    motionMediaQuery.addListener(setReducedMotionPreferences)
    setReducedMotionPreferences()
}

/**
 * Determine whether the user prefers reduced motion.
 *
 * Returns `null` if called server-side.
 *
 * @internal
 */
export const isReducedMotion = () => prefersReducedMotion
