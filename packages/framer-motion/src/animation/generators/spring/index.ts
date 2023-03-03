import { KeyframeGenerator } from "../types"

export function spring(): KeyframeGenerator<number> {
    return {
        next: (t: number) => {
            return { value: 0, done: false }
        },
    }
}
