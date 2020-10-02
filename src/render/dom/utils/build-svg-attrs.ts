import { Dimensions, TransformOrigin, DOMVisualElementConfig } from "../types"
import { ResolvedValues } from "../../VisualElement/types"
import { calcSVGTransformOrigin } from "./svg-transform-origin"
import { buildSVGPath } from "./build-svg-path"
import { buildHTMLStyles } from "./build-html-styles"
import { BoxDelta, Point2D, AxisBox2D } from "../../../types/geometry"

const unmeasured = { x: 0, y: 0, width: 0, height: 0 }

/**
 * Build SVG visual attrbutes, like cx and style.transform
 */
export function buildSVGAttrs(
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
    style: ResolvedValues,
    vars: ResolvedValues,
    attrs: ResolvedValues,
    transform: ResolvedValues,
    transformOrigin: TransformOrigin,
    transformKeys: string[],
    config: DOMVisualElementConfig,
    dimensions: Dimensions,
    totalPathLength: number,
    isLayoutProjectionEnabled?: boolean,
    delta?: BoxDelta,
    deltaFinal?: BoxDelta,
    treeScale?: Point2D,
    targetBox?: AxisBox2D
): ResolvedValues {
    /**
     * With SVG we treat all animated values as attributes rather than CSS, so we build into attrs
     */
    buildHTMLStyles(
        latest,
        attrs,
        vars,
        transform,
        transformOrigin,
        transformKeys,
        config,
        isLayoutProjectionEnabled,
        delta,
        deltaFinal,
        treeScale,
        targetBox
    )

    /**
     * However, we apply transforms as CSS transforms. So if we detect a transform we take it from attrs
     * and copy it into style.
     */
    if (attrs.transform) {
        style.transform = attrs.transform
        delete attrs.transform
    }

    // Parse transformOrigin
    if (originX !== undefined || originY !== undefined || style.transform) {
        style.transformOrigin = calcSVGTransformOrigin(
            dimensions || unmeasured,
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

    return attrs
}
