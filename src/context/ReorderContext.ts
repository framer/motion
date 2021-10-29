import { createContext } from "react"
import { ReorderContextProps } from "../components/Reorder/types"

export const ReorderContext = createContext<ReorderContextProps<any> | null>(
    null
)
