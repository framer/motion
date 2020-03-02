import { useContext } from "react"
import { MotionContext } from "../../motion/context/MotionContext"

type Present = [true]

type NotPresent = [false, () => void]

export function usePresence(): Present | NotPresent {
    const { exitProps } = useContext(MotionContext)

    if (!exitProps) return [true]

    const { isExiting, onExitComplete } = exitProps
    return isExiting && onExitComplete ? [false, onExitComplete] : [true]
}
