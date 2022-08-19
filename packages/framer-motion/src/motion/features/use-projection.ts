import { VisualElement } from "../../render/types"
import { MotionProps } from "../types"
import { isRefObject } from "../../utils/is-ref-object"
import { IProjectionNode } from "../../projection/node/types"
import { useContext } from "react"
import { SwitchLayoutGroupContext } from "../../context/SwitchLayoutGroupContext"

export function useProjection(
    projectionId: number | undefined,
    { layoutId, layout, drag, dragConstraints, layoutScroll }: MotionProps,
    visualElement?: VisualElement,
    ProjectionNodeConstructor?: any
) {
    const initialPromotionConfig = useContext(SwitchLayoutGroupContext)

    if (
        !ProjectionNodeConstructor ||
        !visualElement ||
        (visualElement && visualElement.projection)
    ) {
        return
    }

    visualElement.projection = new ProjectionNodeConstructor(
        projectionId,
        visualElement.getLatestValues(),
        visualElement.parent && visualElement.parent.projection
    ) as IProjectionNode

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
        layoutScroll,
    })
}
