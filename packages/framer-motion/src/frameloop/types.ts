export type FrameData = {
    delta: number
    timestamp: number
}

export type Process = (data: FrameData) => void

export type Schedule = (
    process: Process,
    keepAlive?: boolean,
    immediate?: boolean
) => Process

export interface Step {
    schedule: Schedule
    cancel: (process: Process) => void
    process: (frame: FrameData) => void
}

export type StepId =
    | "read"
    | "update"
    | "postUpdate"
    | "preRender"
    | "render"
    | "postRender"

export type Sync = {
    [key in StepId]: Schedule
}

export type Steps = {
    [key in StepId]: Step
}

export type CancelSync = {
    [key in StepId]: (process: Process) => void
}

export type FlushSync = {
    [key in StepId]: () => void
}
