import { HTMLProjectionNode } from "../../projection/node/HTMLProjectionNode"
import { VisualElement } from "../../render/types"
import { MotionProps } from "../types"
import { useEffect } from "react"
import { isRefObject } from "../../utils/is-ref-object"
import { InitialPromotionConfig } from "context/SwitchLayoutGroupContext"

export function useProjection(
    projectionId: number | undefined,
    {
        layoutId,
        layout,
        drag,
        dragConstraints,
        onProjectionUpdate,
        shouldMeasureScroll,
    }: MotionProps,
    visualElement?: VisualElement,
    initialPromotionConfig?: InitialPromotionConfig
) {
    /**
     * Update latest options
     * TODO: Currently only updating onProjectionUpdate but this will be where
     * to add support for changing layoutId etc
     */
    useEffect(() => {
        if (!visualElement) return
        const { projection } = visualElement
        if (!projection) return

        projection.setOptions({
            ...projection.options,
            onProjectionUpdate,
        })
    }, [visualElement, onProjectionUpdate])

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
