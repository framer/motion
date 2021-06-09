import sync, { getFrameData } from "framesync"
import { calcRelativeOffset } from "../../../motion/features/layout/utils"
import { eachAxis } from "../../../utils/each-axis"
import { copyAxisBox } from "../../../utils/geometry"
import { applyBoxTransforms } from "../../../utils/geometry/delta-apply"
import { VisualElement } from "../../types"
import { compareByDepth } from "../../utils/compare-by-depth"

function isProjecting(visualElement: VisualElement) {
    const { isEnabled } = visualElement.projection

    return (
        isEnabled ||
        visualElement.shouldResetTransform() ||
        visualElement.getProps()._applyTransforms
    )
}

export function collectProjectingAncestors(
    visualElement: VisualElement,
    ancestors: VisualElement[] = []
) {
    const { parent } = visualElement

    if (parent) collectProjectingAncestors(parent, ancestors)

    if (isProjecting(visualElement)) ancestors.push(visualElement)

    return ancestors
}

export function collectProjectingChildren(
    visualElement: VisualElement
): VisualElement[] {
    const children: VisualElement[] = []

    const addChild = (child: VisualElement) => {
        if (isProjecting(child)) children.push(child)
        child.children.forEach(addChild)
    }

    visualElement.children.forEach(addChild)

    return children.sort(compareByDepth)
}

/**
 * Update the layoutState by measuring the DOM layout. This
 * should be called after resetting any layout-affecting transforms.
 */
export function updateLayoutMeasurement(
    visualElement: VisualElement
) {
    if (visualElement.shouldResetTransform()) return

    const layoutState = visualElement.getLayoutState()

    visualElement.notifyBeforeLayoutMeasure(layoutState.layout)

    layoutState.isHydrated = true
    layoutState.layout = visualElement.measureViewportBox()
    layoutState.layoutCorrected = copyAxisBox(layoutState.layout)

    const { snapshot } = visualElement
    visualElement.notifyLayoutMeasure(
        layoutState.layout,
        snapshot ? snapshot.viewportBox : layoutState.layout
    )

    if (!visualElement.isProjectionReady()) {
        const projectionParent = visualElement.getProjectionParent()

        if (projectionParent) {
            const parentLayout = projectionParent.getLayoutState()

            if (parentLayout && parentLayout.isHydrated) {
                const nextParentLayout = copyAxisBox(parentLayout.layout)
                visualElement.path.forEach((node) => {
                    if (node.getProps()._applyTransforms) {
                        applyBoxTransforms(
                            nextParentLayout,
                            nextParentLayout,
                            node.getLatestValues()
                        )
                    }
                    const target = calcRelativeOffset(
                        nextParentLayout,
                        layoutState.layout
                    )

                    eachAxis((axis) =>
                        visualElement.setProjectionTargetAxis(
                            axis,
                            target[axis].min,
                            target[axis].max,
                            true
                        )
                    )
                })
            }
        }
    }

    sync.update(() => visualElement.rebaseProjectionTarget())
}

/**
 * Record the viewport box as it was before an expected mutation/re-render
 */
export function snapshotViewportBox(
    visualElement: VisualElement,
    rebase = true
) {
    if (visualElement.shouldResetTransform()) return

    visualElement.snapshot = {
        taken: getFrameData().timestamp,
        transform: { ...visualElement.getLatestValues() },
        viewportBox: visualElement.measureViewportBox(
            visualElement.getProps()._applyTransforms ? true : false
        ),
    }

    /**
     * Update targetBox to match the snapshot. This is just to ensure
     * that targetBox is affected by scroll in the same way as the measured box
     */
    rebase &&
        visualElement.rebaseProjectionTarget(
            false,
            visualElement.snapshot.viewportBox
        )
}
