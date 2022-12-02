import { frameData } from "./data"
import { Step, Process } from "./types"

export function createRenderStep(runNextFrame: () => void): Step {
    /**
     * We create and reuse two arrays, one to queue jobs for the current frame
     * and one for the next. We reuse to avoid triggering GC after x frames.
     */
    let toRun: Set<Process> = new Set()
    let toRunNextFrame: Set<Process> = new Set()

    /**
     * Track whether we're currently processing jobs in this step. This way
     * we can decide whether to schedule new jobs for this frame or next.
     */
    let isProcessing = false

    let flushNextFrame = false

    /**
     * A set of processes which were marked keepAlive when scheduled.
     */
    const toKeepAlive = new WeakSet<Process>()

    const fireCallback = (callback: Process) => {
        callback(frameData)

        if (toKeepAlive.has(callback)) {
            step.schedule(callback)
            runNextFrame()
        }
    }

    const step: Step = {
        /**
         * Schedule a process to run on the next frame.
         */
        schedule: (callback, keepAlive = false, immediate = false) => {
            const addToCurrentFrame = immediate && isProcessing
            const buffer = addToCurrentFrame ? toRun : toRunNextFrame

            if (keepAlive) toKeepAlive.add(callback)

            // If the buffer doesn't already contain this callback, add it
            buffer.add(callback)

            return callback
        },

        /**
         * Cancel the provided callback from running on the next frame.
         */
        cancel: (callback) => {
            toRunNextFrame.delete(callback)
            toKeepAlive.delete(callback)
        },

        /**
         * Execute all schedule callbacks.
         */
        process: () => {
            /**
             * If we're already processing we've probably been triggered by a flushSync
             * inside an existing process. Instead of executing, mark flushNextFrame
             * as true and ensure we flush the following frame at the end of this one.
             */
            if (isProcessing) {
                flushNextFrame = true
                return
            }

            isProcessing = true

            // Swap this frame and the next to avoid GC
            ;[toRun, toRunNextFrame] = [toRunNextFrame, toRun]

            // Clear the next frame list
            toRunNextFrame.clear()

            if (toRun.size) {
                toRun.forEach(fireCallback)
            }

            isProcessing = false

            if (flushNextFrame) {
                flushNextFrame = false
                step.process(frameData)
            }
        },
    }

    return step
}
