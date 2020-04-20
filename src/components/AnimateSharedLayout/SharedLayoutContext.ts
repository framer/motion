import { createContext } from "react"
import {
    SharedLayoutTree,
    MagicBatchTree,
} from "../../motion/features/auto/types"
import { batchTransitions } from "../../motion/features/auto/utils"

/**
 * @internal
 */
export const SharedLayoutContext = createContext<
    SharedLayoutTree | MagicBatchTree
>(batchTransitions())
