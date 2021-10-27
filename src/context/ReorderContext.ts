import React from "react"
import { ReorderContextProps } from "../components/Reorder/types"

export const ReorderContext =
    React.createContext<ReorderContextProps<any> | null>(null)
