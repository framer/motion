import { useLayoutEffect } from "react"

type Callback = () => void

enum StepName {
    Prepare = "prepare",
    Read = "read",
    Render = "render",
}

type CallbackLists = {
    prepare: Callback[]
    read: Callback[]
    render: Callback[]
}

const stepOrder: StepName[] = [StepName.Prepare, StepName.Read, StepName.Render]

const jobs: CallbackLists = stepOrder.reduce((acc, key) => {
    acc[key] = []
    return acc
}, {}) as CallbackLists

let jobsNeedProcessing = false

function flushCallbackList(list: Callback[]) {
    const numJobs = list.length

    for (let i = 0; i < numJobs; i++) {
        list[i]()
    }

    list.length = 0
}

function flushAllJobs() {
    if (!jobsNeedProcessing) return

    flushCallbackList(jobs.prepare)
    flushCallbackList(jobs.read)
    flushCallbackList(jobs.render)
    jobsNeedProcessing = false
}

// Note: The approach of schedulng jobs during the render step is incompatible with concurrent mode
// where multiple renders might happen without a DOM update. This would result in unneccessary batched
// jobs. But this was already a problem with our previous approach to positionTransition.
// Hopefully the React team offer a getSnapshotBeforeUpdate-esque hook and we can move to that.
const createUseSyncEffect = (stepName: StepName) => (callback?: Callback) => {
    if (!callback) return

    jobsNeedProcessing = true
    jobs[stepName].push(callback)
}

export const layoutSync = {
    [StepName.Prepare]: createUseSyncEffect(StepName.Prepare),
    [StepName.Read]: createUseSyncEffect(StepName.Read),
    [StepName.Render]: createUseSyncEffect(StepName.Render),
}

// TODO: If we ever make this a public hook, add a check within `createUseSyncEffect` that, in development mode,
// adds a useEffect to check if there's any remaining jobs and throw an error that we must add the `useLayoutSync`
// hook to every component that schedules a job.
export function useLayoutSync() {
    return useLayoutEffect(flushAllJobs)
}
