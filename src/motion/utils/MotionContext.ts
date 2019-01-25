import { createContext, useContext, useMemo } from "react"
import { AnimationControls } from "./use-animation-controls"
import { VariantLabels } from "motion/types"
import { Target } from "types"

type MotionContextProps = {
    controls?: AnimationControls
    initial?: VariantLabels | Target
    dragging?: boolean
}

export const MotionContext = createContext<MotionContextProps>({
    dragging: false,
})

export const useMotionContext = (
    controls: AnimationControls,
    initialProp?: VariantLabels | Target
) => {
    const parentContext = useContext(MotionContext)
    const initial = initialProp || parentContext.initial
    const context: MotionContextProps = useMemo(
        () => ({ controls, initial }),
        []
    )

    context.dragging = parentContext.dragging

    // Set initial state
    useMemo(() => {
        initial && controls.apply(initial)
    }, [])

    return context
}
