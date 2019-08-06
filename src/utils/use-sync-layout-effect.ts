import { useLayoutEffect } from "react"

type Callback = () => void

type StepName = "prepare" | "read" | "render"

type SyncEffectHooks = {
    [key: string]: (callback?: Callback) => void
}

type CallbackLists = {
    prepare: Callback[]
    read: Callback[]
    render: Callback[]
}

const stepOrder: StepName[] = ["prepare", "read", "render"]

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

// TODO: This is incompatible with concurrent mode where multiple renders might
// happen without a DOM update. This would result in batched jobs. Hopefully the
// React team offer a getSnapshotBeforeUpdate hook and we can move to that.
const createUseSyncEffect = (stepName: StepName) => (
    callback?: Callback | undefined
) => {
    if (callback) {
        jobsNeedProcessing = true
        jobs[stepName].push(callback)
    }

    return useLayoutEffect(flushAllJobs)
}

export const useSyncEffect: SyncEffectHooks = stepOrder.reduce((acc, key) => {
    acc[key] = createUseSyncEffect(key)
    return acc
}, {})
