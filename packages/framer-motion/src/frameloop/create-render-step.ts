import { Step, Process } from "./types"

export function createRenderStep(runNextFrame: () => void): Step {
    /**
     * We create and reuse two arrays, one to queue jobs for the current frame
     * and one for the next. We reuse to avoid triggering GC after x frames.
     */
    let toRun: Process[] = []
    let toRunNextFrame: Process[] = []

    /**
     *
     */
    let numToRun = 0

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

    const step: Step = {
        /**
         * Schedule a process to run on the next frame.
         */
        schedule: (callback, keepAlive = false, immediate = false) => {
            const addToCurrentFrame = immediate && isProcessing
            const buffer = addToCurrentFrame ? toRun : toRunNextFrame

            if (keepAlive) toKeepAlive.add(callback)

            // If the buffer doesn't already contain this callback, add it
            if (buffer.indexOf(callback) === -1) {
                buffer.push(callback)

                // If we're adding it to the currently running buffer, update its measured size
                if (addToCurrentFrame && isProcessing) numToRun = toRun.length
            }

            return callback
        },

        /**
         * Cancel the provided callback from running on the next frame.
         */
        cancel: (callback) => {
            const index = toRunNextFrame.indexOf(callback)
            if (index !== -1) toRunNextFrame.splice(index, 1)

            toKeepAlive.delete(callback)
        },

        /**
         * Execute all schedule callbacks.
         */
        process: (frameData) => {
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
            toRunNextFrame.length = 0

            // Execute this frame
            numToRun = toRun.length

            if (numToRun) {
                for (let i = 0; i < numToRun; i++) {
                    const callback = toRun[i]

                    callback(frameData)

                    if (toKeepAlive.has(callback)) {
                        step.schedule(callback)
                        runNextFrame()
                    }
                }
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
