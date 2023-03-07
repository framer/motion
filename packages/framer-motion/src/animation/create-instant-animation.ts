import { AnimationPlaybackControls } from "./animate"
import { animateValue } from "./js"
import { AnimationOptions } from "./types"

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
            stop: () => {},
            currentTime: 0,
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
