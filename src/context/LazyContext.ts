import React from "react"
import { CreateVisualElement } from "../render/types"

export interface LazyContextProps {
    renderer?: CreateVisualElement<any>
    strict: boolean
}

export const LazyContext = React.createContext<LazyContextProps>({
    strict: false,
})
