"use client"

import { createContext } from "react"
import { ReorderContextProps } from "../components/Reorder/types"

export const ReorderContext =
    /* @__PURE__ */ createContext<ReorderContextProps<any> | null>(null)
