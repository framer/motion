import { AnimationPlaybackControls } from "./types"
import { animateValue } from "./js"
import { AnimationOptions } from "./types"
import { noop } from "../utils/noop"

export function createInstantAnimation<V>({
    keyframes,
    delay: delayBy,
    onUpdate,
    onComplete,
}: AnimationOptions<V>): AnimationPlaybackControls {
    const setValue = () => {
        onUpdate && onUpdate(keyframes[keyframes.length - 1])
        onComplete && onComplete()

        return {
            currentTime: 0,
            play: noop<void>,
            pause: noop<void>,
            stop: noop<void>,
            then: Promise.resolve,
        }
    }

    return delayBy
        ? animateValue({
              keyframes: [0, 1],
              duration: delayBy,
              onComplete: setValue,
          })
        : setValue()
}
