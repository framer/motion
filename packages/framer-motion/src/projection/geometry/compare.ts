import { AxisDelta } from "./types"

export function hasAxisDeltaChanged(a: AxisDelta, b: AxisDelta) {
    return (
        a.translate !== b.translate ||
        a.scale !== b.scale ||
        a.originPoint !== b.originPoint ||
        a.origin !== b.origin
    )
}
