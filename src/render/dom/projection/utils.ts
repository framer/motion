import sync from "framesync"
import { copyAxisBox } from "../../../utils/geometry"
import { VisualElement } from "../../types"
import { compareByDepth } from "../../utils/compare-by-depth"

export function updateTreeLayoutMeasurements(
    visualElement: VisualElement,
    isRelativeDrag: boolean
) {
    withoutTreeTransform(visualElement, () => {
        const allChildren = collectProjectingChildren(visualElement)
        batchResetAndMeasure(allChildren)

        updateLayoutMeasurement(visualElement)
    })

    !isRelativeDrag &&
        visualElement.rebaseProjectionTarget(
            true,
            visualElement.measureViewportBox(false)
        )
}

export function collectProjectingChildren(
    visualElement: VisualElement
): VisualElement[] {
    const children: VisualElement[] = []

    const addChild = (child: VisualElement) => {
        if (
            child.projection.isEnabled ||
            child.getProps()._layoutResetTransform
        )
            children.push(child)
        child.children.forEach(addChild)
    }

    visualElement.children.forEach(addChild)

    return children.sort(compareByDepth)
}

/**
 * Perform the callback after temporarily unapplying the transform
 * upwards through the tree.
 */
export function withoutTreeTransform(
    visualElement: VisualElement,
    callback: () => void
) {
    const { parent } = visualElement
    const { isEnabled } = visualElement.projection
    const shouldReset =
        isEnabled || visualElement.getProps()._layoutResetTransform

    shouldReset && visualElement.resetTransform()

    parent ? withoutTreeTransform(parent, callback) : callback()

    shouldReset && visualElement.restoreTransform()
}

/**
 * Update the layoutState by measuring the DOM layout. This
 * should be called after resetting any layout-affecting transforms.
 */
export function updateLayoutMeasurement(visualElement: VisualElement) {
    if (!visualElement.shouldSnapshot()) return

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
    if (!visualElement.shouldSnapshot()) return
    visualElement.prevViewportBox = visualElement.measureViewportBox(false)

    /**
     * Update targetBox to match the prevViewportBox. This is just to ensure
     * that targetBox is affected by scroll in the same way as the measured box
     */
    visualElement.rebaseProjectionTarget(false, visualElement.prevViewportBox)
}

export function batchResetAndMeasure(order: VisualElement[]) {
    /**
     * Write: Reset any transforms on children elements so we can read their actual layout
     */
    order.forEach((child) => child.resetTransform())

    /**
     * Read: Measure the actual layout
     */
    order.forEach(updateLayoutMeasurement)
}
