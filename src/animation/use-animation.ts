import { AnimationManager } from "."
import { useMemo, useEffect } from "react"
import { Transition, Variants } from "../types"

export const useAnimation = (variants?: Variants, defaultTransition?: Transition) => {
    const animationManager = useMemo(() => new AnimationManager(), [])

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
