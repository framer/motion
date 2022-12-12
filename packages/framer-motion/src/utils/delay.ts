import { sync, cancelSync } from "../frameloop"
import { FrameData } from "../frameloop/types"

export type DelayedFunction = (overshoot: number) => void

/**
 * Timeout defined in ms
 */
export function delay(callback: DelayedFunction, timeout: number) {
    const start = performance.now()
    console.log("delay by", timeout)
    const checkElapsed = ({ timestamp }: FrameData) => {
        const elapsed = timestamp - start

        console.log(elapsed)
        if (elapsed >= timeout) {
            cancelSync.read(checkElapsed)
            callback(elapsed - timeout)
        }
    }

    sync.read(checkElapsed, true)

    return () => cancelSync.read(checkElapsed)
}
