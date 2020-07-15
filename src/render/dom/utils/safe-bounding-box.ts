import { AxisBox2D } from "../../../types/geometry"
import { eachAxis } from "../../../utils/each-axis"

/**
 * If a bounding box is measured as 0 on either axis we encounter
 * divide by zero errors. We can prevent the actual errors by dividing by
 * an arbitrarily low amount, but then it's possible to see bugs where
 * child elements appear smeared across the screen. By setting each axis
 * to a non-zero measurement, the element itself will disappear (as you
 * can't invert scale: 0) but it will correctly animate back out, and it
 * fixes distortion on any children.
 */
export function safeBoundingBox(box: AxisBox2D): AxisBox2D {
    const safePixels = 0.5

    eachAxis(axis => {
        const boxAxis = box[axis]
        if (boxAxis.min === boxAxis.max) {
            boxAxis.min -= safePixels
            boxAxis.max += safePixels
        }
    })

    return box
}
