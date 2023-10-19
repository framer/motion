import { createRenderBatcher } from "./batcher"

export const { schedule: microtask, cancel: cancelMicrotask } =
    createRenderBatcher(queueMicrotask, false)
