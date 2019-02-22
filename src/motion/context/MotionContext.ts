import { createContext, useContext, useMemo } from "react"
import { ComponentAnimationControls } from "../../animation/ComponentAnimationControls"
import { VariantLabels } from "../types"
import { Target } from "../../types"

type MotionContextProps = {
    controls?: ComponentAnimationControls
    initial?: VariantLabels
    dragging?: boolean
    static?: boolean
}

/**
 * @internal
 */
export const MotionContext = createContext<MotionContextProps>({
    dragging: false,
    static: false,
})

const isTarget = (v?: VariantLabels | Target): v is Target => {
    return v !== undefined && typeof v !== "string" && !Array.isArray(v)
}

export const useMotionContext = (
    controls: ComponentAnimationControls,
    staticComponent: boolean = false,
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
    context.static = parentContext.static || staticComponent

    // Set initial state
    useMemo(() => {
        const initialToApply = initial || parentContext.initial

        initialToApply && controls.apply(initialToApply)
    }, [])

    return context
}
