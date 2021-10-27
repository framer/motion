import React from "react"
import { VisualElement } from "../../render/types"

export interface MotionContextProps {
    visualElement?: VisualElement
    initial?: false | string | string[]
    animate?: string | string[]
}

export const MotionContext = React.createContext<MotionContextProps>({})

export function useVisualElementContext() {
    return React.useContext(MotionContext).visualElement
}
