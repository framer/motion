import { IProjectionNode } from "../projection/node/types"
import { createContext } from "react"
import { Transition } from "../types"

export interface SwitchLayoutGroup {
    register?: (member: IProjectionNode) => void
    deregister?: (member: IProjectionNode) => void
}

export type SwitchLayoutGroupContext = SwitchLayoutGroup & {
    /**
     * The initial transition to use when the elements in this group mount (and automatically promoted).
     * Subsequent updates should provide a transition in the promote method.
     */
    initialTransition?: Transition
}

/**
 * @internal
 */
export const SwitchLayoutGroupContext = createContext<SwitchLayoutGroupContext>(
    {}
)
