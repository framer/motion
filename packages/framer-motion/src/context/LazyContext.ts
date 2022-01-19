import { createContext } from "react"
import { CreateVisualElement } from "../render/types"

export interface LazyContextProps {
    renderer?: CreateVisualElement<any>
    strict: boolean
}

export const LazyContext = createContext<LazyContextProps>({ strict: false })
