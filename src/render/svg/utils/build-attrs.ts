import { DOMVisualElementOptions } from "../../dom/types"
import { buildHTMLStyles } from "../../html/utils/build-styles"
import { ResolvedValues } from "../../types"
import { calcSVGTransformOrigin } from "./transform-origin"
import { buildSVGPath } from "./path"
import { MotionProps } from "../../../motion/types"
import { LayoutState, TargetProjection } from "../../utils/state"
import { SVGRenderState } from "../types"

/**
 * Build SVG visual attrbutes, like cx and style.transform
 */
export function buildSVGAttrs(
    state: SVGRenderState,
    {
        attrX,
        attrY,
        originX,
        originY,
        pathLength,
        pathSpacing = 1,
        pathOffset = 0,
        // This is object creation, which we try to avoid per-frame.
        ...latest
    }: ResolvedValues,
    projection: TargetProjection | undefined,
    layoutState: LayoutState | undefined,
    options: DOMVisualElementOptions,
    transformTemplate?: MotionProps["transformTemplate"]
) {
    buildHTMLStyles(
        state,
        latest,
        projection,
        layoutState,
        options,
        transformTemplate
    )

    state.attrs = state.style
    state.style = {}
    const { attrs, style, dimensions, totalPathLength } = state
    /**
     * However, we apply transforms as CSS transforms. So if we detect a transform we take it from attrs
     * and copy it into style.
     */
    if (attrs.transform) {
        if (dimensions) style.transform = attrs.transform
        delete attrs.transform
    }

    // Parse transformOrigin
    if (
        dimensions &&
        (originX !== undefined || originY !== undefined || style.transform)
    ) {
        style.transformOrigin = calcSVGTransformOrigin(
            dimensions,
            originX !== undefined ? originX : 0.5,
            originY !== undefined ? originY : 0.5
        )
    }

    // Treat x/y not as shortcuts but as actual attributes
    if (attrX !== undefined) attrs.x = attrX
    if (attrY !== undefined) attrs.y = attrY

    // Build SVG path if one has been measured
    if (totalPathLength !== undefined && pathLength !== undefined) {
        buildSVGPath(
            attrs,
            totalPathLength,
            pathLength as number,
            pathSpacing as number,
            pathOffset as number,
            false
        )
    }
}
