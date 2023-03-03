import { KeyframeGenerator } from "./types"

export function keyframes<T>(): KeyframeGenerator<T> {
    return {
        next: (t: number) => {
            return { value: 0, done: false }
        },
    }
}
