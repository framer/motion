import { FrameData, Process, Step } from "./types"

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
     * A keepAlive process is always also held by a frame queue until
     * it's cancelled, so a Set has the same lifetime semantics as a
     * WeakSet here while being considerably faster to query every frame.
     */
    const toKeepAlive = new Set<Process>()

    let latestFrameData: FrameData = {
        delta: 0.0,
        timestamp: 0.0,
        isProcessing: false,
    }

    function triggerCallback(callback: Process) {
        if (toKeepAlive.has(callback)) {
            nextFrame.add(callback)
            runNextFrame()
        }

        callback(latestFrameData)

        /**
         * Remove the callback once it's run, so if it's scheduled with
         * `immediate` again later in this step (for instance, a value it
         * reads is changed by a later callback), it's re-added and runs
         * again rather than being deduplicated against the run that's
         * already happened. Removing it after rather than before it runs
         * means a callback that re-schedules itself while running (like a
         * transform whose change listener writes to one of its inputs)
         * is still deduplicated, so it can't loop forever.
         */
        thisFrame.delete(callback)
    }

    const step: Step = {
        /**
         * Schedule a process to run on the next frame.
         */
        schedule: (callback, keepAlive = false, immediate = false) => {
            const addToCurrentFrame = immediate && isProcessing
            const queue = addToCurrentFrame ? thisFrame : nextFrame

            if (keepAlive) toKeepAlive.add(callback)

            queue.add(callback)

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
            const prevFrame = thisFrame
            thisFrame = nextFrame
            nextFrame = prevFrame

            /**
             * Execute this frame. Each callback removes itself as it runs,
             * so no callbacks remain once this finishes.
             */
            thisFrame.forEach(triggerCallback)

            isProcessing = false

            if (flushNextFrame) {
                flushNextFrame = false
                step.process(frameData)
            }
        },
    }

    return step
}
