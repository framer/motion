import { easeInOut } from "../../easing/ease"
import { EasingFunction } from "../../easing/types"
import { interpolate } from "../../utils/interpolate"
import { Animation, AnimationState, KeyframeOptions } from "./types"

export function defaultEasing(
    values: any[],
    easing?: EasingFunction
): EasingFunction[] {
    return values.map(() => easing || easeInOut).splice(0, values.length - 1)
}

export function defaultOffset(values: any[]): number[] {
    const numValues = values.length
    return values.map((_value: number, i: number): number =>
        i !== 0 ? i / (numValues - 1) : 0
    )
}

export function convertOffsetToTimes(offset: number[], duration: number) {
    return offset.map((o) => o * duration)
}

export function keyframes({
    from = 0,
    to = 1,
    ease,
    offset,
    duration = 300,
}: KeyframeOptions): Animation<number | string> {
    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state: AnimationState<typeof from> = { done: false, value: from }

    /**
     * Convert values to an array if they've been given as from/to options
     */
    const values = Array.isArray(to) ? to : [from, to]

    /**
     * Create a times array based on the provided 0-1 offsets
     */
    const times = convertOffsetToTimes(
        // Only use the provided offsets if they're the correct length
        // TODO Maybe we should warn here if there's a length mismatch
        offset && offset.length === values.length
            ? offset
            : defaultOffset(values),
        duration
    )

    function createInterpolator() {
        return interpolate(times, values, {
            ease: Array.isArray(ease) ? ease : defaultEasing(values, ease),
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
            values.reverse()
            interpolator = createInterpolator()
        },
    }
}
