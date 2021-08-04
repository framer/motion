import { HTMLProjectionNode } from "../../projection/node/HTMLProjectionNode"
import { VisualElement } from "../../render/types"
import { MotionProps } from "../types"
import { Transition } from "../../types"
import { useEffect } from "react"

export function useProjection(
    projectionId: number | undefined,
    { layoutId, layout, drag, onProjectionUpdate }: MotionProps,
    visualElement?: VisualElement,
    initialTransition?: Transition
) {
    if (!visualElement) return

    /**
     * Update latest options
     * TODO: Currently only updating onProjectionUpdate but this will be where
     * to add support for changing layoutId etc
     */
    useEffect(() => {
        const { projection } = visualElement
        if (!projection) return

        projection.setOptions({
            ...projection.options,
            onProjectionUpdate,
        })
    }, [onProjectionUpdate])

    if (visualElement.projection) return

    visualElement.projection = new HTMLProjectionNode(
        projectionId,
        visualElement.getLatestValues(),
        visualElement.parent?.projection
    )

    visualElement.projection.setOptions({
        layoutId,
        layout,
        alwaysMeasureLayout: !!drag,
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
        transition: initialTransition,
    })
}
