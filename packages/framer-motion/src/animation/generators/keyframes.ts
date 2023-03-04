import { easeInOut } from "../../easing/ease"
import { EasingFunction } from "../../easing/types"
import { interpolate } from "../../utils/interpolate"
import { defaultOffset } from "../../utils/offsets/default"
import { convertOffsetToTimes } from "../../utils/offsets/time"
import { AnimationOptions } from "../types"
import { easingDefinitionToFunction, isEasingArray } from "../utils/easing"
import { AnimationState, KeyframeGenerator } from "./types"

export function defaultEasing(
    values: any[],
    easing?: EasingFunction
): EasingFunction[] {
    return values.map(() => easing || easeInOut).splice(0, values.length - 1)
}

export function keyframes<T>({
    duration = 300,
    keyframes: keyframeValues,
    times,
    ease = "easeInOut",
}: AnimationOptions<T>): KeyframeGenerator<T> {
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
    const state: AnimationState<T> = {
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

    const mapTimeToKeyframe = interpolate<T>(absoluteTimes, keyframeValues, {
        ease: Array.isArray(easingFunctions)
            ? easingFunctions
            : defaultEasing(keyframeValues, easingFunctions),
    })

    return {
        next: (t: number) => {
            state.value = mapTimeToKeyframe(t)
            state.done = t >= duration
            return state
        },
    }
}
