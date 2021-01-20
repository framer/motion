import { axisBox, delta as initDelta } from "../../utils/geometry"
import {
    applyBoxTransforms,
    applyTreeDeltas,
    resetBox,
} from "../../utils/geometry/delta-apply"
import { updateBoxDelta } from "../../utils/geometry/delta-calc"
import { Projection, ResolvedValues, VisualElement } from "../types"

export function initProjection(): Projection {
    return {
        isEnabled: false,
        isTargetLocked: false,
        layout: axisBox(),
        layoutCorrected: axisBox(),
        target: axisBox(),
        targetFinal: axisBox(),
        treeScale: { x: 1, y: 1 },
        delta: initDelta(),
        deltaFinal: initDelta(),
    }
}

export function updateLayoutDeltas(
    { delta, layout, layoutCorrected, target, treeScale }: Projection,
    treePath: VisualElement[]
) {
    /**
     * Reset the corrected box with the latest values from box, as we're then going
     * to perform mutative operations on it.
     */
    resetBox(layoutCorrected, layout)

    /**
     * Apply all the parent deltas to this box to produce the corrected box. This
     * is the layout box, as it will appear on screen as a result of the transforms of its parents.
     */
    applyTreeDeltas(layoutCorrected, treeScale, treePath)

    /**
     * Update the delta between the corrected box and the target box before user-set transforms were applied.
     * This will allow us to calculate the corrected borderRadius and boxShadow to compensate
     * for our layout reprojection, but still allow them to be scaled correctly by the user.
     * It might be that to simplify this we may want to accept that user-set scale is also corrected
     * and we wouldn't have to keep and calc both deltas, OR we could support a user setting
     * to allow people to choose whether these styles are corrected based on just the
     * layout reprojection or the final bounding box.
     */
    updateBoxDelta(
        delta,
        layoutCorrected,
        target
        // layoutOrigin replace with latest
    )
}

export function updateTransformDeltas(
    latest: ResolvedValues,
    projection: Projection
) {
    if (!projection.isEnabled) return

    /**
     * Apply the latest user-set transforms to the targetBox to produce the targetBoxFinal.
     * This is the final box that we will then project into by calculating a transform delta and
     * applying it to the corrected box.
     */
    applyBoxTransforms(projection.targetFinal, projection.target, latest)

    /**
     * Update the delta between the corrected box and the final target box, after
     * user-set transforms are applied to it. This will be used by the renderer to
     * create a transform style that will reproject the element from its actual layout
     * into the desired bounding box.
     */
    updateBoxDelta(
        projection.deltaFinal,
        projection.layoutCorrected,
        projection.targetFinal
        // projection.layoutOrigin - Use latest.originX/originY
    )
}
