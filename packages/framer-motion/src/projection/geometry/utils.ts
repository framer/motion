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

export function roundedBoxEquals(a: Box, b: Box) {
    return (
        Math.round(a.x.min) === Math.round(b.x.min) &&
        Math.round(a.x.max) === Math.round(b.x.max) &&
        Math.round(a.y.min) === Math.round(b.y.min) &&
        Math.round(a.y.max) === Math.round(b.y.max)
    )
}

export function aspectRatio(box: Box): number {
    return calcLength(box.x) / calcLength(box.y)
}
