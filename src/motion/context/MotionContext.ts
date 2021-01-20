import { createContext, useContext } from "react"
import { VisualElement } from "../../render/types"

export const MotionContext = createContext<VisualElement | undefined>(undefined)

export function useVisualElementContext() {
    return useContext(MotionContext)
}
