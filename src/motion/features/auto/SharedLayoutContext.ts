import { createContext } from "react"
import { SharedLayoutTree, MagicBatchTree } from "./types"
import { batchTransitions } from "./utils"

/**
 * @internal
 */
export const SharedLayoutContext = createContext<
    SharedLayoutTree | MagicBatchTree
>(batchTransitions())
