import { frameSteps } from "./frame"
import { frameData } from "./frame-data"
import { time } from "./sync-time"

/**
 * Process a frame now, for driving Motion from a loop other than
 * window.requestAnimationFrame, like an XRSession's during an immersive
 * WebXR session. Wherever window.requestAnimationFrame does fire, Motion
 * keeps processing frames from it too.
 *
 * `timestamp` defaults to now. For a timeline you control, set
 * `MotionGlobalConfig.useManualTiming = true` and pass each frame's time in
 * milliseconds.
 *
 * Animations Motion hands to the browser (WAAPI), like `opacity` or
 * `transform` on an HTML or SVG element, follow the browser's clock instead.
 *
 * Ignored when called inside a frame.
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
