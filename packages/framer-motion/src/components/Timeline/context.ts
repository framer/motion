import { createContext } from "react"
import { Timeline } from "./types"

export const TimelineContext = createContext<Timeline | undefined>(undefined)
