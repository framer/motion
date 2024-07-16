import { Axis, AxisDelta, Box } from "./types"

/**
 * Reset an axis to the provided origin box.
 *
 * This is a mutative operation.
 */
export function copyAxisInto(axis: Axis, originAxis: Axis) {
    axis.min = originAxis.min
    axis.max = originAxis.max
}

/**
 * Reset a box to the provided origin box.
 *
 * This is a mutative operation.
 */
export function copyBoxInto(box: Box, originBox: Box) {
    box.x.min = originBox.x.min
    box.x.max = originBox.x.max
    box.y.min = originBox.y.min
    box.y.max = originBox.y.max
}

export function copyAxisDeltaInto(delta: AxisDelta, originDelta: AxisDelta) {
    delta.translate = originDelta.translate
    delta.scale = originDelta.scale
    delta.originPoint = originDelta.originPoint
    delta.origin = originDelta.origin
}
