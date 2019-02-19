import { createContext, useContext, useMemo } from "react"
import { ComponentAnimationControls } from "../../animation/ComponentAnimationControls"
import { VariantLabels } from "../types"
import { Target } from "../../types"

type MotionContextProps = {
    controls?: ComponentAnimationControls
    initial?: VariantLabels
    dragging?: boolean
}

export const MotionContext = createContext<MotionContextProps>({
    dragging: false,
})

const isTarget = (v?: VariantLabels | Target): v is Target =>
    v !== undefined && typeof v !== "string" && !Array.isArray(v)

export const useMotionContext = (
    controls: ComponentAnimationControls,
    initial?: VariantLabels | Target
) => {
    const parentContext = useContext(MotionContext)

    const context: MotionContextProps = useMemo(
        () => ({
            controls,
            initial:
                initial && !isTarget(initial) ? initial : parentContext.initial,
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
