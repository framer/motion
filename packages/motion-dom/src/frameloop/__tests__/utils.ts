import { MotionGlobalConfig } from "motion-utils"
import { frameData } from "../frame-data"
import { processFrame } from "../process-frame"

/**
 * Run each test in the current describe block on a manual clock, for tests
 * whose animations start before the first stepFrames. Frames from
 * requestAnimationFrame still fire but don't advance time.
 */
export const withManualFrames = () => {
    beforeEach(() => {
        MotionGlobalConfig.useManualTiming = true
    })
    afterEach(() => {
        MotionGlobalConfig.useManualTiming = false
    })
}

/**
 * Switch to a manual clock, then advance it by `duration` ms, processing a
 * frame every `frameDuration` ms and letting promises settle between frames.
 * Reset MotionGlobalConfig.useManualTiming after the test.
 */
export const stepFrames = async (
    duration: number,
    frameDuration = 1000 / 60
) => {
    MotionGlobalConfig.useManualTiming = true
    const end = frameData.timestamp + duration
    let timestamp = frameData.timestamp
    while (timestamp < end) {
        processFrame((timestamp = Math.min(timestamp + frameDuration, end)))
        await Promise.resolve()
    }
}
