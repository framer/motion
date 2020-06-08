import { Dimensions } from "../types"
import { ResolvedValues } from "../../types"
import { calcSVGTransformOrigin } from "./svg-transform-origin"
import { buildSVGPath } from "./build-svg-path"
import { SVGVisualElement } from "../SVGVisualElement"

const unmeasured = { x: 0, y: 0, width: 0, height: 0 }

export function buildSVGAttrs(
    {
        attrX,
        attrY,
        originX,
        originY,
        pathLength,
        pathSpacing = 1,
        pathOffset = 0,
    }: ResolvedValues,
    style: ResolvedValues,
    attrs: ResolvedValues,
    dimensions: Dimensions,
    totalPathLength: number
): ResolvedValues {
    if (style.transform) {
        attrs.transform = style.transform
        delete style.transform
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

export function buildSVGProps(visualElement: SVGVisualElement) {
    visualElement.clean()
    visualElement.build()

    return {
        ...visualElement.attrs,
        style: visualElement.style,
    }
}
