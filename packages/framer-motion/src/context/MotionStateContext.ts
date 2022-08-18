import { createContext } from "react"
import { MotionState } from "../components/motion/state"

export const MotionStateContext = createContext<MotionState | undefined>(
    undefined
)
