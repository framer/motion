import { createContext } from "react"
import { SharedMagicTree, MagicBatchTree } from "./types"
import { batchTransitions } from "./utils"

/**
 * @internal
 */
export const MagicContext = createContext<SharedMagicTree | MagicBatchTree>(
    batchTransitions()
)
