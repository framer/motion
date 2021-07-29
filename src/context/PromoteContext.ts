import { IProjectionNode } from "../projection/node/types"
import { createContext } from "react"

export interface PromoteGroupContext {
    group?: Set<IProjectionNode>
}

/**
 * @internal
 */
export const PromoteGroupContext = createContext<PromoteGroupContext>({})
