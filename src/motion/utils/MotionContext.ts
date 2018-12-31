import { createContext } from "react"

export const MotionContext = createContext({
    pose: "default",
    controls: null,
})
