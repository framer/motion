import { MotionGlobalConfig } from "../utils/GlobalConfig"
import { createRenderStep } from "./render-step"
import { Batcher, Process, StepId, Steps, FrameData, Step } from "./types"

export const stepsOrder: Readonly<StepId[]> = [
    "read", // Read
    "resolveKeyframes", // Write/Read/Write/Read
    "update", // Compute
    "preRender", // Compute
    "render", // Write
    "postRender", // Compute
] as const
const stepsOrderLength = stepsOrder.length

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

    const nextFrameFn = () => (runNextFrame = true)
    const steps: Steps = {
        read: createRenderStep(nextFrameFn),
        resolveKeyframes: createRenderStep(nextFrameFn),
        update: createRenderStep(nextFrameFn),
        preRender: createRenderStep(nextFrameFn),
        render: createRenderStep(nextFrameFn),
        postRender: createRenderStep(nextFrameFn),
    }

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
        for (let i = 0; i < stepsOrderLength; ++i) processStep(stepsOrder[i])
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

    const batchFn = (
        step: Step,
        process: Process,
        keepAlive = false,
        immediate = false
    ) => {
        if (!runNextFrame) wake()

        return step.schedule(process, keepAlive, immediate)
    }
    const schedule: Batcher = {
        read: batchFn.bind(undefined, steps.read),
        resolveKeyframes: batchFn.bind(undefined, steps.resolveKeyframes),
        update: batchFn.bind(undefined, steps.update),
        preRender: batchFn.bind(undefined, steps.preRender),
        render: batchFn.bind(undefined, steps.render),
        postRender: batchFn.bind(undefined, steps.postRender),
    }

    const cancel = (process: Process) => {
        for (let i = 0; i < stepsOrderLength; ++i)
            steps[stepsOrder[i]].cancel(process)
    }

    return { schedule, cancel, state, steps }
}
