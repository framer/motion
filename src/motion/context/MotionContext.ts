import { createContext, useContext } from "react"
import { VisualElement } from "../../render/VisualElement"

export interface VariantContextProps {
    parent?: VisualElement
    initial?: string | string[] | false
    animate?: string | string[]
    whileHover?: string | string[]
    whileTap?: string | string[]
    whileDrag?: string | string[]
    exit?: string | string[]
}

interface MotionContextProps {
    visualElement?: VisualElement
    variantContext: VariantContextProps
}

export const MotionContext = createContext<MotionContextProps>({
    variantContext: {},
})

export function useVariantContext() {
    return useContext(MotionContext).variantContext
}

export function useVisualElementContext() {
    return useContext(MotionContext).visualElement
}
