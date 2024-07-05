import { MotionGlobalConfig } from "../utils/GlobalConfig"
import { createRenderStep } from "./render-step"
import {
    Batcher,
    Process,
    StepId,
    Steps,
    FrameData,
    Step,
    Schedule,
} from "./types"

export const stepsOrder: StepId[] = [
    "read", // Read
    "resolveKeyframes", // Write/Read/Write/Read
    "update", // Compute
    "preRender", // Compute
    "render", // Write
    "postRender", // Compute
]
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

    const steps: Record<keyof Steps, Step | null> = {
        read: null,
        resolveKeyframes: null,
        update: null,
        preRender: null,
        render: null,
        postRender: null,
    }
    const runNextFrameFn = () => (runNextFrame = true)
    for (let i = 0; i < stepsOrderLength; ++i) {
        const key = stepsOrder[i]
        steps[key] = createRenderStep(runNextFrameFn)
    }

    const processStep = (stepId: StepId) => {
        ;(steps as Steps)[stepId].process(state)
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

    const schedule: Record<keyof Batcher, Schedule | null> = {
        read: null,
        resolveKeyframes: null,
        update: null,
        preRender: null,
        render: null,
        postRender: null,
    }
    for (let i = 0; i < stepsOrderLength; ++i) {
        const key = stepsOrder[i]
        const step = (steps as Steps)[key]
        schedule[key] = (
            process: Process,
            keepAlive = false,
            immediate = false
        ) => {
            if (!runNextFrame) wake()

            return step.schedule(process, keepAlive, immediate)
        }
    }

    const cancel = (process: Process) => {
        for (let i = 0; i < stepsOrderLength; ++i)
            (steps as Steps)[stepsOrder[i]].cancel(process)
    }

    return { schedule, cancel, state, steps }
}
