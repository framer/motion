type Job = () => void
type Queue = Job[][]
type QueueLookup = Map<string, Queue>

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

    const schedule = (job: Job, direction: 1 | -1) => {
        // Make job list if none created
        if (!queue[queueIndex]) queue[queueIndex] = []

        const jobs = queue[queueIndex]

        direction === 1 ? jobs.push(job) : jobs.unshift(job)

        queueIndex++
    }

    session(
        job => schedule(job, 1),
        job => schedule(job, -1)
    )
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
