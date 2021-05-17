type Job = () => void

type JobSetter = (job: Job) => void

type ReadWrites = (read: JobSetter, write: JobSetter) => void

const unresolvedJobs = new Set<ReadWrites>()

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
     * Execute jobs
     */
    const numStacks = writes.length
    for (let i = 0; i <= numStacks; i++) {
        reads[i] && reads[i].forEach(executeJob)
        writes[i] && writes[i].forEach(executeJob)
    }
}

const executeJob = (job: Job) => job()
