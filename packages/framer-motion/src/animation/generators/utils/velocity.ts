import { velocityPerSecond } from "../../../utils/velocity-per-second"
import { velocitySampleDuration } from "./velocity-sample-duration"

export function calcGeneratorVelocity(
    resolveValue: (v: number) => number,
    t: number,
    current: number
) {
    const prevT = Math.max(t - velocitySampleDuration, 0)
    return velocityPerSecond(current - resolveValue(prevT), t - prevT)
}
