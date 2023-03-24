import { AbsoluteKeyframe } from "../types"

export function compareByTime(
    a: AbsoluteKeyframe,
    b: AbsoluteKeyframe
): number {
    if (a.at === b.at) {
        return a.value === null ? 0 : -1
    } else {
        return a.at - b.at
    }
}
