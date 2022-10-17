import sync, { cancelSync, FrameData } from "framesync"

export type DelayedFunction = (overshoot: number) => void

export function delay(callback: DelayedFunction, timeout: number) {
    const start = performance.now()

    const checkElapsed = ({ timestamp }: FrameData) => {
        const elapsed = timestamp - start
        if (elapsed >= timeout) {
            cancelSync.read(checkElapsed)
            callback(elapsed - timeout)
        }
    }

    sync.read(checkElapsed, true)

    return () => cancelSync.read(checkElapsed)
}
