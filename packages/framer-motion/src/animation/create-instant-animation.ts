import { delay } from "../utils/delay"
import { AnimationOptions } from "./types"

export function createInstantAnimation<V>({
    keyframes,
    elapsed,
    onUpdate,
    onComplete,
}: AnimationOptions<V>) {
    const setValue = () => {
        onUpdate && onUpdate(keyframes[keyframes.length - 1])
        onComplete && onComplete()
    }

    return elapsed ? { stop: delay(setValue, -elapsed) } : setValue()
}
