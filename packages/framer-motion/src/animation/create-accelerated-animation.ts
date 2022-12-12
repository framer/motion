
import type { VisualElement } from "../render/VisualElement"
import type { MotionValue } from "../value"
import { animate } from "./legacy-popmotion"
import { spring } from "./legacy-popmotion/spring"
import type { AnimationOptions } from "./types"
import { animateStyle } from "./waapi"

const sampleDelta = 10 //ms

/**
 *
 */
export function createAcceleratedAnimation(
    value: MotionValue,
    valueName: string,
    options: AnimationOptions
) {
    let { keyframes, duration = 0.3, elapsed = 0 } = options

    /**
     * If this is a spring animation, pre-generate keyframes and
     * record duration.
     */
    if (options.type === "spring") {
        const springAnimation = spring(options)
        let state = { done: false, value: keyframes[0] }
        const springKeyframes: number[] = []

        let t = 0
        while (!state.done) {
            state = springAnimation.next(t)
            springKeyframes.push(state.value)
            t += sampleDelta
        }

        keyframes = springKeyframes
        duration = t
    }

    const animation = animateStyle(
        (value.owner as VisualElement<HTMLElement>).current!,
        valueName,
        keyframes,
        { delay: -elapsed, duration }
    )

    return () => {
        const { currentTime } = animation!
        animation!.commitStyles()
        animation!.cancel()

        if (currentTime) {
            const sampleAnimation = animate(options)
            value.setWithVelocity(
                sampleAnimation.sampleForT(currentTime - sampleDelta),
                sampleAnimation.sampleForT(currentTime),
                sampleDelta
            )
        }
    }
}
