import { buildHTMLStyles } from "../../html/utils/build-styles"
import { ResolvedValues } from "../../types"
import { calcSVGTransformOrigin } from "./transform-origin"
import { buildSVGPath } from "./path"
import { MotionProps } from "../../../motion/types"
import { SVGRenderState } from "../types"

/**
 * Build SVG visual attrbutes, like cx and style.transform
 */
export function buildSVGAttrs(
    state: SVGRenderState,
    {
        attrX,
        attrY,
        attrScale,
        originX,
        originY,
        pathLength,
        pathSpacing = 1,
        pathOffset = 0,
        // This is object creation, which we try to avoid per-frame.
        ...latest
    }: ResolvedValues,
    isSVGTag: boolean,
    transformTemplate?: MotionProps["transformTemplate"]
) {
    buildHTMLStyles(state, latest, transformTemplate)

    /**
     * For svg tags we just want to make sure viewBox is animatable and treat all the styles
     * as normal HTML tags.
     */
    if (isSVGTag) {
        if (state.style.viewBox) {
            state.attrs.viewBox = state.style.viewBox
        }
        return
    }

    state.attrs = state.style
    state.style = {}
    const { attrs, style, dimensions } = state
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

    // Render attrX/attrY/attrScale as attributes
    if (attrX !== undefined) attrs.x = attrX
    if (attrY !== undefined) attrs.y = attrY
    if (attrScale !== undefined) attrs.scale = attrScale

    // Build SVG path if one has been defined
    if (pathLength !== undefined) {
        buildSVGPath(
            attrs,
            pathLength as number,
            pathSpacing as number,
            pathOffset as number,
            false
        )
    }
}
