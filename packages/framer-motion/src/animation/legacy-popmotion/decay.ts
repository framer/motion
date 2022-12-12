import { DecayOptions } from "../types"
import { Animation, AnimationState } from "./types"

export function decay({
    keyframes = [0],
    velocity = 0,
    power = 0.8,
    timeConstant = 350,
    restDelta = 0.5,
    modifyTarget,
}: DecayOptions): Animation<number> {
    const origin = keyframes[0]

    /**
     * This is the Iterator-spec return value. We ensure it's mutable rather than using a generator
     * to reduce GC during animation.
     */
    const state: AnimationState<number> = { done: false, value: origin }

    let amplitude = power * velocity
    const ideal = origin + amplitude

    const target = modifyTarget === undefined ? ideal : modifyTarget(ideal)

    /**
     * If the target has changed we need to re-calculate the amplitude, otherwise
     * the animation will start from the wrong position.
     */
    if (target !== ideal) amplitude = target - origin

    return {
        next: (t: number) => {
            const delta = -amplitude * Math.exp(-t / timeConstant)
            state.done = !(delta > restDelta || delta < -restDelta)
            state.value = state.done ? target : target + delta
            return state
        },
        flipTarget: () => {},
    }
}
