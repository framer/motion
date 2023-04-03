import { frameloopContext } from "./context"

export function recordFrameloopTasks(callback: VoidFunction) {
    const context: VoidFunction[] = []
    frameloopContext.current = context
    callback()
    frameloopContext.current = undefined

    return () => {
        context.forEach((cancel) => cancel())
    }
}
