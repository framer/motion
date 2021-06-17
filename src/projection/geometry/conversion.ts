import { BoundingBox, Box } from "./types"

/**
 * Bounding boxes tend to be defined as top, left, right, bottom. For various operations
 * it's easier to consider each axis individually. This function returns a bounding box
 * as a map of single-axis min/max values.
 */
export function convertBoundingBoxToBox({
    top,
    left,
    right,
    bottom,
}: BoundingBox): Box {
    return {
        x: { min: left, max: right },
        y: { min: top, max: bottom },
    }
}
