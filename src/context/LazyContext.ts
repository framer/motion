import { createContext } from "react"
import { CreateVisualElement } from "../render/types"

export const LazyContext = createContext<CreateVisualElement<any> | undefined>(
    undefined
)
