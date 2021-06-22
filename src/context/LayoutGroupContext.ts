import { createContext } from "react"
import { NodeGroup } from "../projection/node/group"

export interface LayoutGroupContextProps {
    prefix?: string
    group?: NodeGroup
}

/**
 * @internal
 */
export const LayoutGroupContext = createContext<LayoutGroupContextProps>({})
