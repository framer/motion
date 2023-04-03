export interface FrameloopContext {
    current: void | VoidFunction[]
}

export const frameloopContext: FrameloopContext = {
    current: undefined,
}
