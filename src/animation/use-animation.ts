import { AnimationGroupControls } from "./AnimationGroupControls"
import { useMemo, useEffect } from "react"
import { Transition, Variants } from "../types"

/**
 * Manually start, stop and sequence animations on one or more `motion` components.
 *
 * @params variants - List of variants. Optional
 * @returns Animation controller with `start` and `stop` methods
 *
 * @public
 */
export function useAnimation(
    variants?: Variants,
    defaultTransition?: Transition
) {
    const animationManager = useMemo(() => new AnimationGroupControls(), [])

    if (variants) {
        animationManager.setVariants(variants)
    }

    if (defaultTransition) {
        animationManager.setDefaultTransition(defaultTransition)
    }

    useEffect(() => {
        animationManager.mount()
        return () => animationManager.unmount()
    }, [])

    return animationManager
}
