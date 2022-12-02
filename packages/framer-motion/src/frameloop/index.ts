import { onNextFrame, defaultTimestep } from "./on-next-frame"
import { createRenderStep } from "./create-render-step"
import {
    Process,
    StepId,
    FrameData,
    CancelSync,
    FlushSync,
    Sync,
    Steps,
} from "./types"
import { frameData } from "./data"

const maxElapsed = 40
let useDefaultElapsed = true
let runNextFrame = false
let isProcessing = false

const stepsOrder: StepId[] = [
    "read",
    "update",
    "preRender",
    "render",
    "postRender",
]

const steps = stepsOrder.reduce((acc, key) => {
    acc[key] = createRenderStep(() => (runNextFrame = true))
    return acc
}, {} as Steps)

const sync = stepsOrder.reduce((acc, key) => {
    const step = steps[key]
    acc[key] = (process: Process, keepAlive = false, immediate = false) => {
        if (!runNextFrame) startLoop()
        return step.schedule(process, keepAlive, immediate)
    }
    return acc
}, {} as Sync)

const cancelSync = stepsOrder.reduce((acc, key) => {
    acc[key] = steps[key].cancel
    return acc
}, {} as CancelSync)

const flushSync = stepsOrder.reduce((acc, key) => {
    acc[key] = () => steps[key].process(frameData)
    return acc
}, {} as FlushSync)

const processStep = (stepId: StepId) => steps[stepId].process(frameData)

const processFrame = (timestamp: number) => {
    runNextFrame = false

    frameData.delta = useDefaultElapsed
        ? defaultTimestep
        : Math.max(Math.min(timestamp - frameData.timestamp, maxElapsed), 1)

    frameData.timestamp = timestamp

    isProcessing = true
    stepsOrder.forEach(processStep)
    isProcessing = false

    if (runNextFrame) {
        useDefaultElapsed = false
        onNextFrame(processFrame)
    }
}

const startLoop = () => {
    runNextFrame = true
    useDefaultElapsed = true

    if (!isProcessing) onNextFrame(processFrame)
}

export default sync
export { cancelSync, flushSync, FrameData, Process }
