import { easingDefinitionToFunction } from "../../animation/utils/easing"
import { transform } from "../../utils/transform"
import { motionValue, MotionValue } from "../../value"
import type { TimelineController, TimelineSequence } from "./types"
import { createUnresolvedTimeline, resolveTrack } from "./utils/create-timeline"
import { defaultTransition } from "./utils/defaults"

export function createTimeline(
    sequence: TimelineSequence,
    progress: MotionValue<number>
): TimelineController {
    return {
        getStatic(trackName) {
            const timeline = createUnresolvedTimeline(sequence).tracks // cache
            const currentProgress = progress.get()
            const staticValues = {}

            for (const valueName in timeline[trackName]) {
                const unresolvedKeyframes = timeline[trackName][valueName]
                const index =
                    currentProgress === 1 ? unresolvedKeyframes.length - 1 : 0
                const { value } = unresolvedKeyframes[index]

                if (value !== null) staticValues[valueName] = value
            }

            return staticValues
        },
        getMotionValues(trackName, readValue) {
            const motionValues = {}
            const { tracks, duration } = createUnresolvedTimeline(sequence) // cache

            const track = tracks[trackName]
            for (const valueName in track) {
                resolveTrack(track[valueName], valueName, readValue)

                const values: Array<string | number> = []
                const times: Array<number> = []
                const easings = []

                for (let i = 0; i < track[valueName].length; i++) {
                    const { at, value, easing } = track[valueName][i]
                    values.push(value as string | number)
                    times.push(at)
                    easings.push(
                        easingDefinitionToFunction(
                            easing || (defaultTransition.easing as any)
                        )
                    )
                }
                easings.pop()

                const timeToValues = transform(times, values, { ease: easings })

                motionValues[valueName] = motionValue(0)
                const update = (latest: number) => {
                    motionValues[valueName].set(timeToValues(latest * duration))
                }
                update(progress.get())
                progress.onChange(update)
            }

            return motionValues
        },
        getDuration() {
            return createUnresolvedTimeline(sequence).duration // cache
        },
    }
}
