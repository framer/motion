import { millisecondsToSeconds } from "motion-utils"
import { GeneratorFactory, Transition } from "../../types"
import { calcGeneratorDuration, maxGeneratorDuration } from "./calc-duration"

/**
 * Create a progress => progress easing function from a generator.
 */
export function createGeneratorEasing(
    options: Transition,
    scale = 100,
    createGenerator: GeneratorFactory
) {
    /**
     * The easing is generated over 0 - scale, but velocity is in the
     * value's own units, so scale it to match. Otherwise an interrupted
     * spring hands off the wrong speed, or direction. Keyframes with
     * units (colours, filters, mixed units) give NaN, which is falsy,
     * so their velocity passes through unscaled.
     */
    const { keyframes: k, velocity: v } = options as any
    const delta = k && k[k.length - 1] - k[0]

    const generator = createGenerator({
        ...options,
        velocity: v && delta ? (v * scale) / delta : v,
        keyframes: [0, scale],
    })
    const duration = Math.min(
        calcGeneratorDuration(generator),
        maxGeneratorDuration
    )

    return {
        type: "keyframes",
        ease: (progress: number) => {
            return generator.next(duration * progress).value / scale
        },
        duration: millisecondsToSeconds(duration),
    }
}
