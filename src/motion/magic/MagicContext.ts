import { createContext } from "react"
import { MagicControlledTree, MagicBatchTree } from "./types"
import { batchUpdate } from "./utils"

/**
 * @internal
 */
export const MagicContext = createContext<MagicControlledTree | MagicBatchTree>(
    batchUpdate()
)
