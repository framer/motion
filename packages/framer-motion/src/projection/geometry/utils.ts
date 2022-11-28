import { calcLength } from "./delta-calc"
import { Box, Delta } from "./types"

export function isDeltaZero(delta: Delta) {
    /**
     * Making !(condition || condition) vs condition && condition allows
     * earlier bailout.
     */
    return !(
        delta.x.translate !== 0 ||
        delta.x.scale !== 1 ||
        delta.y.translate !== 0 ||
        delta.y.scale !== 1
    )
}

export function boxEquals(a: Box, b: Box) {
    return !(
        a.x.min !== b.x.min ||
        a.x.max !== b.x.max ||
        a.y.min !== b.y.min ||
        a.y.max !== b.y.max
    )
}

export function aspectRatio(box: Box): number {
    return calcLength(box.x) / calcLength(box.y)
}
