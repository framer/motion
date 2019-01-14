let prefersReducedMotion = false

if (typeof window !== "undefined") {
    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)")

    const setReducedMotionPreferences = () => (prefersReducedMotion = motionMediaQuery.matches)

    motionMediaQuery.addListener(setReducedMotionPreferences)
    setReducedMotionPreferences()
}

export const isReducedMotion = () => prefersReducedMotion
