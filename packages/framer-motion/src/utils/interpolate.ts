import { invariant } from "../utils/errors"
import { EasingFunction } from "../easing/types"
import { clamp } from "./clamp"
import { pipe } from "./pipe"
import { progress } from "./progress"
import { noop } from "./noop"
import { mix } from "./mix"

type Mix<T> = (v: number) => T
export type MixerFactory<T> = (from: T, to: T) => Mix<T>

export interface InterpolateOptions<T> {
    clamp?: boolean
    ease?: EasingFunction | EasingFunction[]
    mixer?: MixerFactory<T>
}

function createMixers<T>(
    output: T[],
    ease?: EasingFunction | EasingFunction[],
    customMixer?: MixerFactory<T>
) {
    const mixers: Array<Mix<T>> = []
    const mixerFactory: MixerFactory<T> = customMixer || mix
    const numMixers = output.length - 1

    for (let i = 0; i < numMixers; i++) {
        let mixer = mixerFactory(output[i], output[i + 1])

        if (ease) {
            const easingFunction = Array.isArray(ease) ? ease[i] || noop : ease
            mixer = pipe(easingFunction, mixer) as Mix<T>
        }

        mixers.push(mixer)
    }

    return mixers
}

/**
 * Create a function that maps from a numerical input array to a generic output array.
 *
 * Accepts:
 *   - Numbers
 *   - Colors (hex, hsl, hsla, rgb, rgba)
 *   - Complex (combinations of one or more numbers or strings)
 *
 * ```jsx
 * const mixColor = interpolate([0, 1], ['#fff', '#000'])
 *
 * mixColor(0.5) // 'rgba(128, 128, 128, 1)'
 * ```
 *
 * TODO Revist this approach once we've moved to data models for values,
 * probably not needed to pregenerate mixer functions.
 *
 * @public
 */
export function interpolate<T>(
    input: number[],
    output: T[],
    { clamp: isClamp = true, ease, mixer }: InterpolateOptions<T> = {}
): (v: number) => T {
    const inputLength = input.length

    invariant(
        inputLength === output.length,
        "Both input and output ranges must be the same length"
    )

    /**
     * If we're only provided a single input, we can just make a function
     * that returns the output.
     */
    if (inputLength === 1) return () => output[0]
    if (inputLength === 2 && input[0] === input[1]) return () => output[1]

    // If input runs highest -> lowest, reverse both arrays
    if (input[0] > input[inputLength - 1]) {
        input = [...input].reverse()
        output = [...output].reverse()
    }

    const mixers = createMixers(output, ease, mixer)
    const numMixers = mixers.length

    const interpolator = (v: number): T => {
        let i = 0
        if (numMixers > 1) {
            for (; i < input.length - 2; i++) {
                if (v < input[i + 1]) break
            }
        }

        const progressInRange = progress(input[i], input[i + 1], v)

        return mixers[i](progressInRange)
    }

    return isClamp
        ? (v: number) =>
              interpolator(clamp(input[0], input[inputLength - 1], v))
        : interpolator
}
