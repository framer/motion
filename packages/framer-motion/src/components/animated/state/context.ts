import { createContext } from "react"
import { AnimationState } from "./AnimationState"

export const AnimationStateContext = createContext<AnimationState | undefined>(
    undefined
)
