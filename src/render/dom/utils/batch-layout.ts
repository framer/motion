import sync from "framesync"

type Job = () => void

type JobSetter = (job: Job) => void

type ReadWrites = (read: JobSetter, write: JobSetter) => void

const unresolvedJobs = new Set<ReadWrites>()

export const layoutState = {
    isMeasuringLayout: false,
}

function pushJob(stack: Job[][], job: Job, pointer: number) {
    if (!stack[pointer]) stack[pointer] = []
    stack[pointer].push(job)
}

export function batchLayout(callback: ReadWrites) {
    unresolvedJobs.add(callback)
    return () => unresolvedJobs.delete(callback)
}

export function flushLayout() {
    if (!unresolvedJobs.size) return

    let pointer = 0
    const reads: Job[][] = [[]]
    const writes: Job[][] = []

    const setRead = (job: Job) => pushJob(reads, job, pointer)
    const setWrite = (job: Job) => {
        pushJob(writes, job, pointer)
        pointer++
    }

    /**
     * Resolve jobs into their array stacks
     */
    unresolvedJobs.forEach((callback) => {
        callback(setRead, setWrite)
        pointer = 0
    })

    unresolvedJobs.clear()

    /**
     * Mark that we're currently measuring layouts. This allows us to, for instance, ignore
     * hover events that might be triggered as a result of resetting transforms.
     *
     * The postRender/setTimeout combo seems like an odd bit of scheduling but what it's saying
     * is *after* the next render, wait 10ms before re-enabling hover events. Waiting until the
     * next frame completely will result in missed, valid hover events. But events seem to
     * be fired async from their actual action, so setting this to false too soon can still
     * trigger events from layout measurements.
     *
     * Note: If we figure out a way of measuring layout while transforms remain applied, this can be removed.
     * I have attempted unregistering event listeners and setting CSS to pointer-events: none
     * but neither seem to work as expected.
     */
    layoutState.isMeasuringLayout = true
    sync.postRender(() => {
        setTimeout(() => (layoutState.isMeasuringLayout = false), 10)
    })

    /**
     * Execute jobs
     */
    const numStacks = writes.length
    for (let i = 0; i <= numStacks; i++) {
        reads[i] && reads[i].forEach(executeJob)
        writes[i] && writes[i].forEach(executeJob)
    }
}

const executeJob = (job: Job) => job()
