import { ResolvedValues, SVGAttributes } from "./types"
import { MotionProps } from "../../../motion/types"
import { buildStyleProp, BuildStylePropConfig } from "./style"
import { calcSVGTransformOrigin } from "./utils/svg-transform-origin"
import { Dimensions } from "./types"
import { buildPath } from "./path"

interface BuildSVGAttrConfig extends BuildStylePropConfig {
    dimensions: Dimensions
    totalPathLength?: number
}

const svgAttrsTemplate = (): SVGAttributes => ({
    style: {},
})

const unmeasured = { x: 0, y: 0, width: 0, height: 0 }

function buildSVGAttrs(
    {
        attrX,
        attrY,
        originX,
        originY,
        pathLength,
        pathSpacing = 1,
        pathOffset = 0,
        ...latest
    }: ResolvedValues,
    config: BuildSVGAttrConfig,
    attrs: SVGAttributes = svgAttrsTemplate()
): SVGAttributes {
    const style = buildStyleProp(latest, config)

    if (style.transform) {
        attrs.transform = style.transform
        delete style.transform
    }

    // Parse transformOrigin
    if (originX !== undefined || originY !== undefined || style.transform) {
        attrs.style.transformOrigin = calcSVGTransformOrigin(
            config.dimensions || unmeasured,
            originX !== undefined ? originX : 0.5,
            originY !== undefined ? originY : 0.5
        )
    }

    // Treat x/y not as shortcuts but as actual attributes
    if (attrX !== undefined) attrs.x = attrX
    if (attrY !== undefined) attrs.y = attrY

    if (config.totalPathLength !== undefined && pathLength !== undefined) {
        buildPath(
            attrs,
            config.totalPathLength,
            pathLength as number,
            pathSpacing as number,
            pathOffset as number,
            config.useDashCase
        )
    }

    return attrs
}

const reactRenderConfig = {
    enableHardwareAcceleration: false,
    useDashCase: false,
    dimensions: unmeasured,
}

export function buildSVGProps(
    latest: ResolvedValues,
    { style }: MotionProps
): SVGAttributes {
    const attrs = buildSVGAttrs(latest, reactRenderConfig)
    attrs.style = { ...style, ...attrs.style } as any
    return attrs
}
