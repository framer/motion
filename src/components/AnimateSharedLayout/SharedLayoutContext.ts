import { createContext } from "react"
import { SharedLayoutTree, SharedBatchTree } from "./types"
import { batchTransitions } from "../../motion/features/auto/utils"

/**
 * @internal
 */
export const SharedLayoutContext = createContext<
    SharedLayoutTree | SharedBatchTree
>(batchTransitions())
