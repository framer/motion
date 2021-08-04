import { IProjectionNode } from "../projection/node/types"
import { createContext } from "react"
import { Transition } from "../types"

export interface PromoteGroupContext {
    group?: Set<IProjectionNode>
    /**
     * The initial transition to use when the elements in this group mount (and automatically promoted).
     * Subsequent updates should provide a transition in the promote method.
     */
    initialTransition?: Transition
}

/**
 * @internal
 */
export const PromoteGroupContext = createContext<PromoteGroupContext>({})
