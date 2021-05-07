import sync from "framesync"
import { copyAxisBox } from "../../../utils/geometry"
import { VisualElement } from "../../types"
import { compareByDepth } from "../../utils/compare-by-depth"

function isProjecting(visualElement: VisualElement) {
    const { isEnabled } = visualElement.projection
    return isEnabled || visualElement.shouldResetTransform()
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
export function updateLayoutMeasurement(visualElement: VisualElement) {
    if (visualElement.shouldResetTransform()) return

    const layoutState = visualElement.getLayoutState()

    visualElement.notifyBeforeLayoutMeasure(layoutState.layout)

    layoutState.isHydrated = true
    layoutState.layout = visualElement.measureViewportBox()
    layoutState.layoutCorrected = copyAxisBox(layoutState.layout)

    visualElement.notifyLayoutMeasure(
        layoutState.layout,
        visualElement.prevViewportBox || layoutState.layout
    )

    sync.update(() => visualElement.rebaseProjectionTarget())
}

/**
 * Record the viewport box as it was before an expected mutation/re-render
 */
export function snapshotViewportBox(visualElement: VisualElement) {
    if (visualElement.shouldResetTransform()) return
    visualElement.prevViewportBox = visualElement.measureViewportBox(false)

    /**
     * Update targetBox to match the prevViewportBox. This is just to ensure
     * that targetBox is affected by scroll in the same way as the measured box
     */
    visualElement.rebaseProjectionTarget(false, visualElement.prevViewportBox)
}
