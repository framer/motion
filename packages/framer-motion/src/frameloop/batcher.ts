import { MotionGlobalConfig } from "../utils/GlobalConfig"
import { createRenderStep } from "./render-step"
import { Batcher, Process, StepId, Steps, FrameData } from "./types"

export const stepsOrder: StepId[] = [
    "read", // Read
    "resolveKeyframes", // Write/Read/Write/Read
    "update", // Compute
    "preRender", // Compute
    "render", // Write
    "postRender", // Compute
]

export function createRenderBatcher(
    scheduleNextBatch: (callback: Function) => void,
    allowKeepAlive: boolean
) {
    let runNextFrame = false
    let useDefaultElapsed = true

    const state: FrameData = {
        delta: 0.0,
        timestamp: 0.0,
        isProcessing: false,
    }

    const flagRunNextFrame = () => (runNextFrame = true)

    const steps = stepsOrder.reduce((acc, key) => {
        acc[key] = createRenderStep(flagRunNextFrame)
        return acc
    }, {} as Steps)

    const { read, resolveKeyframes, update, preRender, render, postRender } =
        steps

    const processBatch = () => {
        const timestamp = MotionGlobalConfig.useManualTiming
            ? state.timestamp
            : performance.now()
        runNextFrame = false

        state.delta = useDefaultElapsed
            ? 1000 / 60
            : Math.max(timestamp - state.timestamp, 1)
        allowKeepAlive && console.log("frame delta", state.delta)
        state.timestamp = timestamp
        state.isProcessing = true

        // Unrolled render loop for better per-frame performance
        read.process(state)
        resolveKeyframes.process(state)
        update.process(state)
        preRender.process(state)
        render.process(state)
        postRender.process(state)

        state.isProcessing = false

        if (runNextFrame && allowKeepAlive) {
            useDefaultElapsed = false
            scheduleNextBatch(processBatch)
        }
    }

    const wake = () => {
        runNextFrame = true
        useDefaultElapsed = true

        if (!state.isProcessing) {
            scheduleNextBatch(processBatch)
        }
    }

    const schedule = stepsOrder.reduce((acc, key) => {
        const step = steps[key]
        acc[key] = (process: Process, keepAlive = false, immediate = false) => {
            if (!runNextFrame) wake()

            return step.schedule(process, keepAlive, immediate)
        }
        return acc
    }, {} as Batcher)

    const cancel = (process: Process) => {
        for (let i = 0; i < stepsOrder.length; i++) {
            steps[stepsOrder[i]].cancel(process)
        }
    }

    return { schedule, cancel, state, steps }
}
