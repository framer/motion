import { calcRelativeOffset } from "../../../motion/features/layout/utils"
import { eachAxis } from "../../../utils/each-axis"
import { VisualElement } from "../../types"

export function setCurrentViewportBox(visualElement: VisualElement) {
    const projectionParent = visualElement.getProjectionParent()

    if (!projectionParent) {
        visualElement.rebaseProjectionTarget()
        return
    }

    const relativeOffset = calcRelativeOffset(
        projectionParent.getLayoutState().layout,
        visualElement.getLayoutState().layout
    )
    eachAxis((axis) => {
        visualElement.setProjectionTargetAxis(
            axis,
            relativeOffset[axis].min,
            relativeOffset[axis].max,
            true
        )
    })
}
