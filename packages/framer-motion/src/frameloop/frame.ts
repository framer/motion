import { noop } from "motion-utils"
import { createRenderBatcher } from "./batcher"

export const {
    schedule: frame,
    cancel: cancelFrame,
    state: frameData,
    steps: frameSteps,
} = createRenderBatcher(
    typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : noop,
    true
)
