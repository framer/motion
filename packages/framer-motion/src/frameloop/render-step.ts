import { Step, Process, FrameData } from "./types"

// class Queue {
//     order: Process[] = []
//     scheduled: Set<Process> = new Set()

//     add(process: Process) {
//         if (!this.scheduled.has(process)) {
//             this.scheduled.add(process)
//             this.order.push(process)
//             return true
//         }
//     }

//     remove(process: Process) {
//         const index = this.order.indexOf(process)
//         if (index !== -1) {
//             this.order.splice(index, 1)
//             this.scheduled.delete(process)
//         }
//     }

//     clear() {
//         this.order.length = 0
//         this.scheduled.clear()
//     }
// }

export function createRenderStep(runNextFrame: () => void): Step {
    /**
     * We create and reuse two queues, one to queue jobs for the current frame
     * and one for the next. We reuse to avoid triggering GC after x frames.
     */
    let thisFrame = new Set<Process>()
    let nextFrame = new Set<Process>()

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

    let latestFrameData: FrameData = {
        delta: 0,
        timestamp: 0,
        isProcessing: false,
    }

    function executeCallback(callback: Process) {
        if (toKeepAlive.has(callback)) {
            step.schedule(callback)
            runNextFrame()
        }

        callback(latestFrameData)
    }

    const step: Step = {
        /**
         * Schedule a process to run on the next frame.
         */
        schedule: (callback, keepAlive = false, immediate = false) => {
            const addToCurrentFrame = immediate && isProcessing
            const queue = addToCurrentFrame ? thisFrame : nextFrame

            if (keepAlive) toKeepAlive.add(callback)

            if (!queue.has(callback)) queue.add(callback)

            return callback
        },

        /**
         * Cancel the provided callback from running on the next frame.
         */
        cancel: (callback) => {
            nextFrame.delete(callback)
            toKeepAlive.delete(callback)
        },

        /**
         * Execute all schedule callbacks.
         */
        process: (frameData) => {
            latestFrameData = frameData

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
            ;[thisFrame, nextFrame] = [nextFrame, thisFrame]

            // Clear the next frame queue
            nextFrame.clear()

            // Execute this frame
            thisFrame.forEach(executeCallback)

            isProcessing = false

            if (flushNextFrame) {
                flushNextFrame = false
                step.process(frameData)
            }
        },
    }

    return step
}
