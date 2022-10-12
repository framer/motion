import { createContext } from "react"
import { TimelineContextProps } from "./types"

export const TimelineContext = createContext<TimelineContextProps | undefined>(
    undefined
)
