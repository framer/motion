import { useEffect, useState, useContext } from "react"
import { prefersReducedMotion } from "../dom/accessibility"
import { MotionContext } from "../motion/context/MotionContext"

function shouldReduceMotion(
    prefersReduced: boolean | null,
    { detect, force }: { detect: boolean; force: boolean }
): boolean {
    return force ? true : detect && Boolean(prefersReduced)
}

/**
 * A hook that returns `true` if we should be using reduced motion. This is based on
 * whether the host device is set to `prefers-reduced-motion`, and whether this behaviour
 * has been explicitly enabled/disabled via the `ReducedMotion` component.
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
            return prefersReducedMotion.onChange(() =>
                setIsReducedMotion(
                    shouldReduceMotion(
                        prefersReducedMotion.get(),
                        reducedMotion
                    )
                )
            )
        },
        [setIsReducedMotion, reducedMotion.force, reducedMotion.detect]
    )

    return isReducedMotion
}
