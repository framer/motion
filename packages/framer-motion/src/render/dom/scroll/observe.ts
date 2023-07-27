import { cancelFrame, frame } from "../../../frameloop"

type Update = (progress: number) => void

export interface ProgressTimeline {
    currentTime: null | { value: number }

    cancel?: VoidFunction
}

export function observeTimeline(update: Update, timeline: ProgressTimeline) {
    let prevProgress: number

    const onFrame = () => {
        const { currentTime } = timeline
        const percentage = currentTime === null ? 0 : currentTime.value
        const progress = percentage / 100

        if (prevProgress !== progress) {
            update(progress)
        }

        prevProgress = progress
    }

    frame.update(onFrame, true)

    return () => {
        console.log("cancel timeline observation")
        cancelFrame(onFrame)
    }
}
