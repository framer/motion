import { AbsoluteKeyframe } from "../types"

export function compareByTime(
    a: AbsoluteKeyframe,
    b: AbsoluteKeyframe
): number {
    if (a.at === b.at) {
        return a.value === null ? 1 : 0
    } else {
        return a.at - b.at
    }
}
