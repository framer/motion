import { calcRelativeOffset } from "../../../motion/features/layout/utils"
import { AxisBox2D } from "../../../types/geometry"
import { eachAxis } from "../../../utils/each-axis"
import { removeBoxTransforms } from "../../../utils/geometry/delta-apply"
import { VisualElement } from "../../types"

/**
 * Returns a boolean stating whether or not we converted the projection
 * to relative projection.
 */
export function convertToRelativeProjection(
    visualElement: VisualElement,
    isLayoutDrag: boolean = true
) {
    const projectionParent = visualElement.getProjectionParent()

    if (!projectionParent) return false

    let offset: AxisBox2D

    if (isLayoutDrag) {
        offset = calcRelativeOffset(
            projectionParent.projection.target,
            visualElement.projection.target
        )

        removeBoxTransforms(offset, projectionParent.getLatestValues())
    } else {
        offset = calcRelativeOffset(
            projectionParent.getLayoutState().layout,
            visualElement.getLayoutState().layout
        )
    }

    eachAxis((axis) =>
        visualElement.setProjectionTargetAxis(
            axis,
            offset[axis].min,
            offset[axis].max,
            true
        )
    )

    return true
}
