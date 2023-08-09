import { AnimationPlaybackControls, AnimationPlaybackControlsOnResolve, ValueAnimationOptions } from "../types"
import { animateValue } from "./js"
import { noop } from "../../utils/noop"

export function createInstantAnimation<V>({
    keyframes,
    delay,
    onUpdate,
    onComplete,
}: ValueAnimationOptions<V>): AnimationPlaybackControls {
    const setValue = (): AnimationPlaybackControls => {
        onUpdate && onUpdate(keyframes[keyframes.length - 1])
        onComplete && onComplete()

        /**
         * TODO: As this API grows it could make sense to always return
         * animateValue. This will be a bigger project as animateValue
         * is frame-locked whereas this function resolves instantly.
         * This is a behavioural change and also has ramifications regarding
         * assumptions within tests.
         */
        return {
            time: 0,
            speed: 1,
            duration: 0,
            play: noop<void>,
            pause: noop<void>,
            stop: noop<void>,
            then: (resolve: AnimationPlaybackControlsOnResolve) => {
                resolve({ reason: 'finished' })
                return Promise.resolve()
            },
            cancel: noop<void>,
            complete: noop<void>,
        }
    }

    return delay
        ? animateValue({
              keyframes: [0, 1],
              duration: 0,
              delay,
              onComplete: setValue,
          })
        : setValue()
}
