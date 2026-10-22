"use client"

import { createContext } from "react"
import { CreateVisualElement } from "../render/types"

export interface LazyContextProps {
    renderer?: CreateVisualElement
    strict: boolean
}

export const LazyContext = /* @__PURE__ */ createContext<LazyContextProps>({
    strict: false,
})
