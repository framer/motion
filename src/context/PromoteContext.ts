import { IProjectionNode } from "../projection/node/types"
import { createContext } from "react"

export interface PromoteGroupContextProps {
    group?: Set<IProjectionNode>
}

/**
 * @internal
 */
export const PromoteGroupContext = createContext<PromoteGroupContextProps>({})
