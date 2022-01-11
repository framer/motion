import sync, { cancelSync, FrameData } from "framesync"
import { useEffect } from "react"
import { useConstant } from "./use-constant"

export type FrameCallback = (timestamp: number) => void

const getCurrentTime =
    typeof performance !== "undefined"
        ? () => performance.now()
        : () => Date.now()

export function useAnimationFrame(callback: FrameCallback) {
    const initialTimestamp = useConstant(getCurrentTime)

    useEffect(() => {
        const provideTimeSinceStart = ({ timestamp }: FrameData) => {
            callback(timestamp - initialTimestamp)
        }

        sync.update(provideTimeSinceStart, true)
        return () => cancelSync.update(provideTimeSinceStart)
    }, [callback])
}
