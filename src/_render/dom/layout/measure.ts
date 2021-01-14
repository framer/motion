import { TransformPoint2D, AxisBox2D } from "../../../types/geometry"
import {
    convertBoundingBoxToAxisBox,
    transformBoundingBox,
} from "../../../utils/geometry"

/**
 * Measure and return the element bounding box.
 *
 * We convert the box into an AxisBox2D to make it easier to work with each axis
 * individually and programmatically.
 *
 * This function optionally accepts a transformPagePoint function which allows us to compensate
 * for, for instance, measuring the element within a scaled plane like a Framer devivce preview component.
 */
export function getBoundingBox(
    element: Element,
    transformPagePoint?: TransformPoint2D
): AxisBox2D {
    const box = element.getBoundingClientRect()
    return convertBoundingBoxToAxisBox(
        transformBoundingBox(box, transformPagePoint)
    )
}
