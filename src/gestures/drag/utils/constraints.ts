import {
    Axis,
    AxisBox2D,
    BoundingBox2D,
    TransformPoint2D,
    Point2D,
} from "../../../types/geometry"
import { mix } from "@popmotion/popcorn"
import { invariant } from "hey-listen"
import { getBoundingBox } from "../../../render/dom/layout/measure"
import { calcOrigin } from "../../../render/dom/layout/delta-calc"

export interface ResolvedConstraints {
    x: Partial<Axis>
    y: Partial<Axis>
}

export function applyConstraints(
    point: number,
    { min, max }: Partial<Axis>,
    elastic?: number
): number {
    if (min !== undefined && point < min) {
        point = elastic ? mix(min, point, elastic) : Math.max(point, min)
    } else if (max !== undefined && point > max) {
        point = elastic ? mix(max, point, elastic) : Math.min(point, max)
    }

    return point
}

export function calcConstrainedMinPoint(
    point: number,
    length: number,
    progress: number,
    constraints?: Partial<Axis>,
    elastic?: number
): number {
    // Calculate a min point for this axis and apply it to the current pointer
    const min = point - length * progress

    return constraints ? applyConstraints(min, constraints, elastic) : min
}

export function calcRelativeAxisConstraints(
    axis: Axis,
    min?: number,
    max?: number
): Partial<Axis> {
    const constraints: Partial<Axis> = {}
    const length = axis.max - axis.min

    if (min !== undefined) {
        constraints.min = axis.min + min
    }

    if (max !== undefined) {
        constraints.max = axis.min + max - length
    }

    return constraints
}

export function calcRelativeConstraints(
    layoutBox: AxisBox2D,
    { top, left, bottom, right }: Partial<BoundingBox2D>
): ResolvedConstraints {
    return {
        x: calcRelativeAxisConstraints(layoutBox.x, left, right),
        y: calcRelativeAxisConstraints(layoutBox.y, top, bottom),
    }
}

export function calcViewportAxisConstraints(
    layoutAxis: Axis,
    constraintsAxis: Axis
) {
    let min = constraintsAxis.min - layoutAxis.min
    let max = constraintsAxis.max - layoutAxis.max

    // If the constraints axis is actually smaller than the layout axis then we can
    // flip the constraints
    if (
        constraintsAxis.max - constraintsAxis.min <
        layoutAxis.max - layoutAxis.min
    ) {
        ;[min, max] = [max, min]
    }

    return {
        min: layoutAxis.min + min,
        max: layoutAxis.min + max,
    }
}

export function calcViewportConstraints(
    layoutBox: AxisBox2D,
    constraintsBox: AxisBox2D
) {
    return {
        x: calcViewportAxisConstraints(layoutBox.x, constraintsBox.x),
        y: calcViewportAxisConstraints(layoutBox.y, constraintsBox.y),
    }
}

export function calcProgressWithinConstraints(
    layoutBox: AxisBox2D,
    constraintsBox: AxisBox2D
): Point2D {
    return {
        x: calcOrigin(layoutBox.x, constraintsBox.x),
        y: calcOrigin(layoutBox.y, constraintsBox.y),
    }
}

export function calcPositionFromProgress(
    axis: Axis,
    constraints: Axis,
    progress: number
): Axis {
    const axisLength = axis.max - axis.min
    const min = mix(constraints.min, constraints.max - axisLength, progress)
    return { min, max: min + axisLength }
}
