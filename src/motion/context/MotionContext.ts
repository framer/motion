import { createContext, useContext } from "react"
import { VisualElement } from "../../render/types"

export interface VisualElementTree {
    parent?: VisualElement
    variantParent?: VisualElement
}

export const MotionContext = createContext<VisualElementTree>({})

export function useVisualElementContext() {
    return useContext(MotionContext).parent
}
