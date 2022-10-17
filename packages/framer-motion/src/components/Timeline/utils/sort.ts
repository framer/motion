import type { UnresolvedAbsoluteKeyframe } from "../types"

export function compareByTime(
    a: UnresolvedAbsoluteKeyframe,
    b: UnresolvedAbsoluteKeyframe
): number {
    if (a.at === b.at) {
        return a.value === null ? 1 : -1
    } else {
        return a.at - b.at
    }
}
