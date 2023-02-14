import { ResolvedValues } from "../../render/types"
import { mix } from "../../utils/mix"
import { Axis, AxisDelta, Box, Delta } from "./types"

export function calcLength(axis: Axis) {
    return axis.max - axis.min
}

export function isNear(value: number, target = 0, maxDistance = 0.01): boolean {
    return Math.abs(value - target) <= maxDistance
}

export function calcAxisDelta(
    delta: AxisDelta,
    source: Axis,
    target: Axis,
    origin: number = 0.5
) {
    delta.origin = origin
    delta.originPoint = mix(source.min, source.max, delta.origin)

    delta.scale = calcLength(target) / calcLength(source)
    if (isNear(delta.scale, 1, 0.0001) || isNaN(delta.scale)) delta.scale = 1

    delta.translate =
        mix(target.min, target.max, delta.origin) - delta.originPoint
    if (isNear(delta.translate) || isNaN(delta.translate)) delta.translate = 0
}

export function calcBoxDelta(
    delta: Delta,
    source: Box,
    target: Box,
    origin?: ResolvedValues
): void {
    calcAxisDelta(
        delta.x,
        source.x,
        target.x,
        origin ? (origin.originX as number) : undefined
    )
    calcAxisDelta(
        delta.y,
        source.y,
        target.y,
        origin ? (origin.originY as number) : undefined
    )
}

export function calcRelativeAxis(target: Axis, relative: Axis, parent: Axis) {
    target.min = parent.min + relative.min
    target.max = target.min + calcLength(relative)
}

export function calcRelativeBox(target: Box, relative: Box, parent: Box) {
    calcRelativeAxis(target.x, relative.x, parent.x)
    calcRelativeAxis(target.y, relative.y, parent.y)
}

export function calcRelativeAxisPosition(
    target: Axis,
    layout: Axis,
    parent: Axis
) {
    target.min = layout.min - parent.min
    target.max = target.min + calcLength(layout)
}

export function calcRelativePosition(target: Box, layout: Box, parent: Box) {
    calcRelativeAxisPosition(target.x, layout.x, parent.x)
    calcRelativeAxisPosition(target.y, layout.y, parent.y)
}
