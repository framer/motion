import { frameSteps } from "./frame"
import { frameData } from "./frame-data"
import { time } from "./sync-time"

/**
 * Process a frame now, for driving Motion from a loop other than
 * requestAnimationFrame, like an XRSession's.
 *
 * `timestamp` defaults to now. For a timeline you control, like a video
 * render, set `MotionGlobalConfig.useManualTiming = true` and pass each
 * frame's time in milliseconds.
 */
export const processFrame = (timestamp = time.now()) => {
    if (frameData.isProcessing) return

    frameData.delta = timestamp - frameData.timestamp
    time.set((frameData.timestamp = timestamp))
    frameData.isProcessing = true
    // frameSteps' keys are in stepsOrder
    for (const step in frameSteps) {
        frameSteps[step as keyof typeof frameSteps].process(frameData)
    }
    frameData.isProcessing = false
}
