import sync, { cancelSync, FrameData } from "framesync"
import { useContext, useEffect } from "react"
import { useConstant } from "./use-constant"
import { MotionConfigContext } from "../context/MotionConfigContext"

export type FrameCallback = (timestamp: number) => void

const getCurrentTime =
    typeof performance !== "undefined"
        ? () => performance.now()
        : () => Date.now()

export function useAnimationFrame(callback: FrameCallback) {
    const initialTimestamp = useConstant(getCurrentTime)
    const { isStatic } = useContext(MotionConfigContext)

    useEffect(() => {
        if (isStatic) return

        const provideTimeSinceStart = ({ timestamp }: FrameData) => {
            callback(timestamp - initialTimestamp)
        }

        sync.update(provideTimeSinceStart, true)
        return () => cancelSync.update(provideTimeSinceStart)
    }, [callback])
}
