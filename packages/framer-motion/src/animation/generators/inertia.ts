import { KeyframeGenerator } from "./types"

export function inertia(): KeyframeGenerator<number> {
    return {
        next: () => {
            return { value: 0, done: false }
        },
    }
}
