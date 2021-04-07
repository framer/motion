import { calcRelativeOffset } from "../../../motion/features/layout/utils"
import { eachAxis } from "../../../utils/each-axis"
import { VisualElement } from "../../types"

export function convertToRelativeProjection(visualElement: VisualElement) {
    const projectionParent = visualElement.getProjectionParent()

    if (!projectionParent) return false

    const offset = calcRelativeOffset(
        projectionParent.projection.target,
        visualElement.projection.target
    )

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
