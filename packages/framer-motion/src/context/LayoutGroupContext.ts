import { createContext } from "react"
import { NodeGroup } from "../projection/node/group"

export interface LayoutGroupContextProps {
    id?: string
    group?: NodeGroup
    forceRender?: VoidFunction
}

export const LayoutGroupContext = createContext<LayoutGroupContextProps>({})
