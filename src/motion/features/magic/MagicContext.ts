import { createContext } from "react"
import { SharedLayoutTree, MagicBatchTree } from "./types"
import { batchTransitions } from "./utils"

/**
 * @internal
 */
export const MagicContext = createContext<SharedLayoutTree | MagicBatchTree>(
    batchTransitions()
)
