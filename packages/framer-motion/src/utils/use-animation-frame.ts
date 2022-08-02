import sync, { cancelSync, FrameData } from "framesync"
import { useContext, useEffect, useRef } from "react"
import { MotionConfigContext } from "../context/MotionConfigContext"

export type FrameCallback = (timestamp: number) => void

export function useAnimationFrame(callback: FrameCallback) {
    const initialTimestamp = useRef(0)
    const { isStatic } = useContext(MotionConfigContext)

    useEffect(() => {
        if (isStatic) return

        const provideTimeSinceStart = ({ timestamp }: FrameData) => {
            if (!initialTimestamp.current) initialTimestamp.current = timestamp

            callback(timestamp - initialTimestamp.current)
        }

        sync.update(provideTimeSinceStart, true)
        return () => cancelSync.update(provideTimeSinceStart)
    }, [callback])
}
