import { easeInOut } from "../../easing/ease"
import { EasingFunction } from "../../easing/types"
import { interpolate } from "../../utils/interpolate"
import { defaultOffset } from "../../utils/offsets/default"
import { convertOffsetToTimes } from "../../utils/offsets/time"
import { AnimationOptions } from "../types"
import { easingDefinitionToFunction, isEasingArray } from "../utils/easing"
import { Animation, AnimationState } from "./types"

export function defaultEasing(
    values: any[],
    easing?: EasingFunction
): EasingFunction[] {
    return values.map(() => easing || easeInOut).splice(0, values.length - 1)
}

export function keyframes({
    keyframes: keyframeValues,
    ease = easeInOut,
    times,
    duration = 300,
}: AnimationOptions): Animation<number | string> {
    keyframeValues = [...keyframeValues]

    /**
     * Easing functions can be externally defined as strings. Here we convert them
     * into actual functions.
     */
    const easingFunctions = isEasingArray(ease)
        ? ease.map(easingDefinitionToFunction)
        : easingDefinitionToFunction(ease)

    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state: AnimationState<typeof origin> = {
        done: false,
        value: keyframeValues[0],
    }

    /**
     * Create a times array based on the provided 0-1 offsets
     */
    const absoluteTimes = convertOffsetToTimes(
        // Only use the provided offsets if they're the correct length
        // TODO Maybe we should warn here if there's a length mismatch
        times && times.length === keyframeValues.length
            ? times
            : defaultOffset(keyframeValues),
        duration
    )

    function createInterpolator() {
        return interpolate(absoluteTimes, keyframeValues, {
            ease: Array.isArray(easingFunctions)
                ? easingFunctions
                : defaultEasing(keyframeValues, easingFunctions),
        })
    }

    let interpolator = createInterpolator()

    return {
        next: (t: number) => {
            state.value = interpolator(t)
            state.done = t >= duration
            return state
        },
        flipTarget: () => {
            keyframeValues.reverse()
            interpolator = createInterpolator()
        },
    }
}
