type Job = () => void
type JobDescription = { depth: number; callback: Job }
type Queue = JobDescription[][]
type QueueLookup = Map<string, Queue>

type Schedule = (job: Job) => void
export type Session = (schedule: Schedule) => void

const queues: QueueLookup = new Map()

function createQueue(id: string) {
    queues.set(id, [])
}

export function syncTree(queueId: string, depth: number, session: Session) {
    if (!queues.has(queueId)) createQueue(queueId)
    const queue = queues.get(queueId) as Queue

    const status = { isActive: true }
    let jobsIndex = 0

    const schedule = (job: Job) => {
        // Make job list if none created
        if (!queue[jobsIndex]) queue[jobsIndex] = []

        const jobs = queue[jobsIndex]

        // We unshift into the jobs array because `syncTree` is going to be called by
        // child components first but we want to execute from parents down
        jobs.push({ depth, callback: () => status.isActive && job() })

        jobsIndex++
    }

    session(schedule)

    // Our unsubscribe function is basically just setting this mutative state due to the complexities
    // of going through and taking each job out of its respective queue. It will get flushed shortly
    // so there's low risk of memory leaks.
    return () => (status.isActive = false)
}

const runJob = ({ callback }: JobDescription) => callback()
const sortJobs = (a: JobDescription, b: JobDescription) => a.depth - b.depth

export function flushTree(id: string) {
    const queue = queues.get(id)
    if (!queue) return

    const numSteps = queue.length
    for (let stepIndex = 0; stepIndex < numSteps; stepIndex++) {
        const jobs = queue[stepIndex]
        jobs.sort(sortJobs)
        jobs && jobs.forEach(runJob)
    }

    queues.delete(id)
}
