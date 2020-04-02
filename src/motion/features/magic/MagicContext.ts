import { createContext } from "react"
import { MagicControlledTree, MagicBatchTree } from "./types"
import { batchTransitions } from "./utils"

/**
 * @internal
 */
export const MagicContext = createContext<MagicControlledTree | MagicBatchTree>(
    batchTransitions()
)
