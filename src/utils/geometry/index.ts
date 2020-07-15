import {
    BoundingBox2D,
    TransformPoint2D,
    AxisBox2D,
    Axis,
    BoxDelta,
} from "../../types/geometry"
import { noop } from "../noop"

/**
 * Bounding boxes tend to be defined as top, left, right, bottom. For various operations
 * it's easier to consider each axis individually. This function returns a bounding box
 * as a map of single-axis min/max values.
 */
export function convertBoundingBoxToAxisBox({
    top,
    left,
    right,
    bottom,
}: BoundingBox2D): AxisBox2D {
    return {
        x: { min: left, max: right },
        y: { min: top, max: bottom },
    }
}

export function convertAxisBoxToBoundingBox({
    x,
    y,
}: AxisBox2D): BoundingBox2D {
    return {
        top: y.min,
        bottom: y.max,
        left: x.min,
        right: x.max,
    }
}

/**
 * Applies a TransformPoint function to a bounding box. TransformPoint is usually a function
 * provided by Framer to allow measured points to be corrected for device scaling. This is used
 * when measuring DOM elements and DOM event points.
 */
export function transformBoundingBox(
    { top, left, bottom, right }: BoundingBox2D,
    transformPoint: TransformPoint2D = noop
): BoundingBox2D {
    const topLeft = transformPoint({ x: left, y: top })
    const bottomRight = transformPoint({ x: right, y: bottom })

    return {
        top: topLeft.y,
        left: topLeft.x,
        bottom: bottomRight.y,
        right: bottomRight.x,
    }
}

/**
 * Calculate the center point of the provided axis
 */
export function calcAxisCenter({ min, max }: Axis) {
    return (max - min) / 2 + min
}

/**
 * Create an empty axis box of zero size
 */
export function axisBox(): AxisBox2D {
    return { x: { min: 0, max: 1 }, y: { min: 0, max: 1 } }
}

export function copyAxisBox(box: AxisBox2D): AxisBox2D {
    return {
        x: { ...box.x },
        y: { ...box.y },
    }
}

/**
 * Create an empty box delta
 */
const zeroDelta = {
    translate: 0,
    scale: 1,
    origin: 0,
    originPoint: 0,
}

export function delta(): BoxDelta {
    return {
        x: { ...zeroDelta },
        y: { ...zeroDelta },
    }
}
