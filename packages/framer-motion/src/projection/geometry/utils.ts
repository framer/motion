import { distance } from "popmotion"
import { calcLength } from "./delta-calc"
import { AxisDelta, Box, Delta } from "./types"

function isAxisDeltaZero(delta: AxisDelta) {
    return delta.translate === 0 && delta.scale === 1
}

export function isDeltaZero(delta: Delta) {
    return isAxisDeltaZero(delta.x) && isAxisDeltaZero(delta.y)
}

export function boxEquals(a: Box, b: Box) {
    return (
        a.x.min === b.x.min &&
        a.x.max === b.x.max &&
        a.y.min === b.y.min &&
        a.y.max === b.y.max
    )
}

export function aspectRatio(box: Box): number {
    return calcLength(box.x) / calcLength(box.y)
}

export function isCloseTo(a: number, b: number, max = 0.1) {
    return distance(a, b) <= max
}
