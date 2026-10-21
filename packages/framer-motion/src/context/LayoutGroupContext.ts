"use client"

import { createContext } from "react"
import type { NodeGroup } from "motion-dom"

export interface LayoutGroupContextProps {
    id?: string
    group?: NodeGroup
    forceRender?: VoidFunction
}

export const LayoutGroupContext =
    /* @__PURE__ */ createContext<LayoutGroupContextProps>({})
