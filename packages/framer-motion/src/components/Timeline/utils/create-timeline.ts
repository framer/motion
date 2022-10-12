import { TimelineSequence, UnresolvedTimeline } from "../types"
import { calcNextTime } from "./calc-next-time"

export function createUnresolvedTimeline(
    sequence: TimelineSequence
): UnresolvedTimeline {
    const timeline: UnresolvedTimeline = {
        duration: 0,
        tracks: {},
    }

    const labels = new Map<string, number>()

    const prevTime = 0
    let currentTime = 0

    /**
     * Build the timeline for each value by mapping over the defined
     * sequence and converting each segment into keyframes and offsets
     * with absolute time values.
     */
    for (let i = 0; i < sequence.length; i++) {
        const segment = sequence[i]

        /**
         * If this is a timeline label, mark it and skip the rest of
         * this iteration.
         */
        if (!Array.isArray(segment)) {
            labels.set(
                segment.name,
                calcNextTime(currentTime, prevTime, labels, segment.at)
            )
            continue
        }

        const [trackName, target, transition = {}] = segment

        /**
         * If a time position has been defined with need to resolve
         * it relative to the current time.
         */
        currentTime = calcNextTime(currentTime, prevTime, labels, transition.at)

        /**
         * Keep track of the maximum duration within this segment.
         * This will be applied to currentTime once the definition
         * has been parsed.
         */
        for (const key in target) {
        }
    }

    return timeline
}
