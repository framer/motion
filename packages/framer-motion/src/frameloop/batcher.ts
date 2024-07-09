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

const maxElapsed = 40

export function createRenderBatcher(
    scheduleNextBatch: (callback: Function) => void,
    allowKeepAlive: boolean
) {
    let runNextFrame = false
    let useDefaultElapsed = true

    const state: FrameData = {
        delta: 0,
        timestamp: 0,
        isProcessing: false,
    }

    const flagRunNextFrame = () => (runNextFrame = true)

    const steps = stepsOrder.reduce((acc, key) => {
        acc[key] = createRenderStep(flagRunNextFrame)
        return acc
    }, {} as Steps)

    const processStep = (stepId: StepId) => {
        steps[stepId].process(state)
    }

    const processBatch = () => {
        const timestamp = MotionGlobalConfig.useManualTiming
            ? state.timestamp
            : performance.now()
        runNextFrame = false

        state.delta = useDefaultElapsed
            ? 1000 / 60
            : Math.max(Math.min(timestamp - state.timestamp, maxElapsed), 1)

        state.timestamp = timestamp
        state.isProcessing = true

        // Unrolled render loop for better per-frame performance
        processStep(stepsOrder[0])
        processStep(stepsOrder[1])
        processStep(stepsOrder[2])
        processStep(stepsOrder[3])
        processStep(stepsOrder[4])
        processStep(stepsOrder[5])

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

    const cancel = (process: Process) =>
        stepsOrder.forEach((key) => steps[key].cancel(process))

    return { schedule, cancel, state, steps }
}
