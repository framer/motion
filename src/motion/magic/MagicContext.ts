import { createContext } from "react"
import { MagicContextUtils, BatchUpdate } from "./types"
import { batchUpdate } from "./utils"

/**
 * @internal
 */
export const MagicContext = createContext<MagicContextUtils | BatchUpdate>(
    batchUpdate()
)
