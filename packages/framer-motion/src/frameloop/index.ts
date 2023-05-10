import { createRenderStep } from "./create-render-step"
import { Process, StepId, Frameloop, Steps } from "./types"
import { frameData } from "./data"

const maxElapsed = 40
let useDefaultElapsed = true
let runNextFrame = false

export const stepsOrder: StepId[] = [
    "read",
    "update",
    "preRender",
    "render",
    "postRender",
]

export const steps = stepsOrder.reduce((acc, key) => {
    acc[key] = createRenderStep(() => (runNextFrame = true))
    return acc
}, {} as Steps)

const processStep = (stepId: StepId) => steps[stepId].process(frameData)

const processFrame = (timestamp: number) => {
    runNextFrame = false

    frameData.delta = useDefaultElapsed
        ? 1000 / 60
        : Math.max(Math.min(timestamp - frameData.timestamp, maxElapsed), 1)

    frameData.timestamp = timestamp
    frameData.isProcessing = true
    stepsOrder.forEach(processStep)
    frameData.isProcessing = false

    if (runNextFrame) {
        useDefaultElapsed = false
        requestAnimationFrame(processFrame)
    }
}

const startLoop = () => {
    runNextFrame = true
    useDefaultElapsed = true

    if (!frameData.isProcessing) requestAnimationFrame(processFrame)
}

export const frame = stepsOrder.reduce((acc, key) => {
    const step = steps[key]
    acc[key] = (process: Process, keepAlive = false, immediate = false) => {
        if (!runNextFrame) startLoop()
        return step.schedule(process, keepAlive, immediate)
    }
    return acc
}, {} as Frameloop)

export function cancelFrame(process: Process) {
    stepsOrder.forEach((key) => steps[key].cancel(process))
}
