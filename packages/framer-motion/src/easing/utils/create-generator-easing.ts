import { spring } from "../../animation/generators/spring"
import {
    calcGeneratorDuration,
    maxGeneratorDuration,
} from "../../animation/generators/utils/calc-duration"
import { Transition } from "../../animation/types"
import { millisecondsToSeconds } from "../../utils/time-conversion"

/**
 * Create a progress => progress easing function from a generator.
 */
export function createGeneratorEasing(
    options: Transition,
    keyframes: number[]
) {
    const generator = spring({ keyframes, ...options })
    const duration = Math.min(
        calcGeneratorDuration(generator),
        maxGeneratorDuration
    )

    return {
        type: "keyframes",
        ease: (progress: number) => generator.next(duration * progress).value,
        duration: millisecondsToSeconds(duration),
    }
}
