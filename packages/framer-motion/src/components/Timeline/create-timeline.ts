import { MotionValue } from "../../value"
import { Timeline, TimelineSequence } from "./types"
import { createUnresolvedTimeline } from "./utils/create-timeline"

export function createTimeline(
    sequence: TimelineSequence,
    progress: MotionValue<number>
): Timeline {
    return {
        getStatic(trackName) {
            const timeline = createUnresolvedTimeline(sequence).tracks // cache
            const currentProgress = progress.get()
            const staticValues = {}

            for (const valueName in timeline[trackName]) {
                const unresolvedKeyframes = timeline[trackName][valueName]
                const index =
                    currentProgress === 0 ? 0 : unresolvedKeyframes.length - 1
                const { value } = unresolvedKeyframes[index]

                if (value !== null) staticValues[valueName] = value
            }

            return staticValues
        },
    }
}
