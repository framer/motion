import { createContext, useContext, useMemo } from "react"
import { AnimationControls } from "./use-animation-controls"
import { VariantLabels } from "motion/types"
import { Target } from "types"

type MotionContextProps = {
    controls?: AnimationControls
    initial?: VariantLabels
    dragging?: boolean
}

export const MotionContext = createContext<MotionContextProps>({
    dragging: false,
})

const isTarget = (v?: VariantLabels | Target): v is Target =>
    v !== undefined && typeof v !== "string" && !Array.isArray(v)

export const useMotionContext = (
    controls: AnimationControls,
    initial?: VariantLabels | Target
) => {
    const parentContext = useContext(MotionContext)
    const context: MotionContextProps = useMemo(
        () => ({
            controls,
            initial: !isTarget(initial) ? initial : parentContext.initial,
        }),
        []
    )

    context.dragging = parentContext.dragging

    // Set initial state
    useMemo(() => {
        const initialToApply = initial || parentContext.initial

        initialToApply && controls.apply(initialToApply)
    }, [])

    return context
}
