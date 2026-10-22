import { MotionGlobalConfig } from "motion-utils"
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
 * `transform` on an HTML or SVG element, follow the browser's clock. With
 * `useManualTiming` on, Motion runs those in JS instead, except for
 * `motion/mini`, view transitions and optimized appear animations, and
 * colours only the browser can mix, like `oklch()`, which jump to their end.
 *
 * Ignored when called inside a frame.
 */
export const processFrame = (timestamp = time.now()) => {
    if (frameData.isProcessing) return

    const delta = timestamp - frameData.timestamp
    // Clamp like the requestAnimationFrame loop, unless the timeline is ours
    frameData.delta = MotionGlobalConfig.useManualTiming
        ? delta
        : Math.max(Math.min(delta, 40), 1)
    time.set((frameData.timestamp = timestamp))
    frameData.isProcessing = true
    // frameSteps' keys are in stepsOrder
    for (const step in frameSteps) {
        frameSteps[step as keyof typeof frameSteps].process(frameData)
    }
    frameData.isProcessing = false
}
