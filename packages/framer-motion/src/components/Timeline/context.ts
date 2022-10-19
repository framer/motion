import { createContext } from "react"
import type { TimelineController } from "./types"

export const TimelineContext = createContext<TimelineController | undefined>(
    undefined
)
