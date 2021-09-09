import { HTMLProjectionNode } from "../../projection/node/HTMLProjectionNode"
import { VisualElement } from "../../render/types"
import { MotionProps } from "../types"
import { isRefObject } from "../../utils/is-ref-object"
import { InitialPromotionConfig } from "context/SwitchLayoutGroupContext"

export function useProjection(
    projectionId: number | undefined,
    {
        layoutId,
        layout,
        drag,
        dragConstraints,
        shouldMeasureScroll,
    }: MotionProps,
    visualElement?: VisualElement,
    initialPromotionConfig?: InitialPromotionConfig
) {
    if (!visualElement || visualElement?.projection) return

    visualElement.projection = new HTMLProjectionNode(
        projectionId,
        visualElement.getLatestValues(),
        visualElement.parent?.projection
    )

    visualElement.projection.setOptions({
        layoutId,
        layout,
        alwaysMeasureLayout:
            Boolean(drag) || (dragConstraints && isRefObject(dragConstraints)),
        visualElement,
        scheduleRender: () => visualElement.scheduleRender(),
        /**
         * TODO: Update options in an effect. This could be tricky as it'll be too late
         * to update by the time layout animations run.
         * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
         * ensuring it gets called if there's no potential layout animations.
         *
         */
        animationType: typeof layout === "string" ? layout : "both",
        initialPromotionConfig,
        shouldMeasureScroll,
    })
}
