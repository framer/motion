import { invariant } from "hey-listen"

type Job = () => void
type Queue = Job[][]
type QueueLookup = Map<string, Queue>

enum JobType {
    Read,
    Write,
}

type Schedule = (job: Job) => void
type Session = (read: Schedule, write: Schedule) => void

const queues: QueueLookup = new Map()

function createQueue(id: string) {
    queues.set(id, [])
}

export function sync(id: string, session: Session) {
    if (!queues.has(id)) createQueue(id)

    const queue = queues.get(id)
    if (!queue) return

    let queueIndex = 0
    let expectedType: JobType = JobType.Read

    const schedule = (job: Job, type: JobType) => {
        invariant(
            expectedType === type,
            "read/write must be called alternately"
        )

        // Make job list if none created
        if (!queue[queueIndex]) {
            queue[queueIndex] = []
        }

        const jobs = queue[queueIndex]
        jobs.push(job)

        expectedType = type === JobType.Read ? JobType.Write : JobType.Read
        queueIndex++
    }

    const read = (job: Job) => schedule(job, JobType.Read)
    const write = (job: Job) => schedule(job, JobType.Write)

    session(read, write)
}

const runJob = (job: Job) => job()

export function flush(id: string) {
    const queue = queues.get(id)

    if (!queue) return

    const numSteps = queue.length
    for (let stepIndex = 0; stepIndex < numSteps; stepIndex++) {
        const jobs = queue[stepIndex]
        jobs && jobs.forEach(runJob)
    }

    queues.delete(id)
}
