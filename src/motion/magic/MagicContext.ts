import { createContext } from "react"
import { MagicContextUtils } from "./types"

export const MagicContext = createContext<MagicContextUtils | null>(null)
