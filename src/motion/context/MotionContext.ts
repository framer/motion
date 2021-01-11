import { createContext, useContext } from "react"
import { VisualElement } from "../../render/VisualElement"
import { VariantLabels } from "../types"

export interface VariantContextProps {
    parent?: VisualElement
    initial?: VariantLabels | false
    animate?: VariantLabels
    whileHover?: VariantLabels
    whileTap?: VariantLabels
    whileDrag?: VariantLabels
    whileFocus?: VariantLabels
    exit?: VariantLabels
}

export interface MotionContextProps {
    visualElement?: VisualElement
    variantContext: VariantContextProps
}

export const MotionContext = createContext<MotionContextProps>({
    variantContext: {},
})

/**
 * @internal
 */
export function useVariantContext() {
    return useContext(MotionContext).variantContext
}

export function useVisualElementContext() {
    return useContext(MotionContext).visualElement
}
