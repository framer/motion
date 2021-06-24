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
