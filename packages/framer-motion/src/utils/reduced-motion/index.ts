import { isBrowser } from "../is-browser"
import {
    hasReducedMotionListener,
    prefersReducedMotion,
    reducedMotionListenerCallbacks,
} from "./state"

export function initPrefersReducedMotion() {
    if (!isBrowser) return
    hasReducedMotionListener.current = true

    if (window.matchMedia) {
        const motionMediaQuery = window.matchMedia("(prefers-reduced-motion)")
        const setReducedMotionPreferences = (event: MediaQueryListEvent) => {
            prefersReducedMotion.current = event.matches

            reducedMotionListenerCallbacks.forEach((callback) =>
                callback(event)
            )
        }

        motionMediaQuery.addEventListener("change", setReducedMotionPreferences)
        prefersReducedMotion.current = motionMediaQuery.matches
    } else {
        prefersReducedMotion.current = false
    }
}
