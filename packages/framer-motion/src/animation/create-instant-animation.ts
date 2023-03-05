import { delay } from "../utils/delay"
import { AnimationOptions } from "./types"

export function createInstantAnimation<V>({
    keyframes,
    delay: delayBy,
    onUpdate,
    onComplete,
}: AnimationOptions<V>) {
    const setValue = () => {
        onUpdate && onUpdate(keyframes[keyframes.length - 1])
        onComplete && onComplete()
    }

    return delayBy ? { stop: delay(setValue, delayBy) } : setValue()
}
