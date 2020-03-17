import { SVGAttrs } from "./types"
import { createBuildStyles } from "../utils/style"
import { BoundingBox, Styles, VisualElementOptions } from "../types"
import { camelToDash } from "../../../utils/camel-to-dash"
import { px } from "style-value-types"

export function buildSVGAttrs(
    attrs = svgAttrsTemplate(),
    {
        attrX,
        attrY,
        originX,
        originY,
        pathLength,
        pathSpacing = 1,
        pathOffset = 0,
        ...styles
    }: Styles = {},
    opts: VisualElementOptions = {},
    buildStyle = createBuildStyles(),
    dimensions: BoundingBox = noDimensions,
    totalPathLength: number = 0,
    isDashCase = true
) {
    if (!attrs.style) attrs.style = {}
    console.log(opts)
    const style = buildStyle(styles, opts)

    for (const key in style) {
        if (key === "transform") {
            attrs.style.transform = style[key] as string
        } else {
            const attrKey =
                opts.isDashCase && !camelCaseAttributes.has(key)
                    ? camelToDash(key)
                    : key
            attrs[attrKey] = style[key]
        }
    }

    // Parse transformOrigin
    if (originX !== undefined || originY !== undefined || style.transform) {
        attrs.style.transformOrigin = calculateSVGTransformOrigin(
            dimensions,
            originX !== undefined ? originX : 0.5,
            originY !== undefined ? originY : 0.5
        )
    }

    // Treat x/y not as shortcuts but as actual attributes
    if (attrX !== undefined) attrs.x = attrX
    if (attrY !== undefined) attrs.y = attrY

    // Handle special path length attributes
    if (totalPathLength !== undefined && pathLength !== undefined) {
        const dashOffsetKey = isDashCase
            ? "stroke-dashoffset"
            : "strokeDashoffset"
        attrs[dashOffsetKey] = progressToPixels(-pathOffset, totalPathLength)

        const dashArrayKey = isDashCase ? "stroke-dasharray" : "strokeDasharray"
        const length = progressToPixels(pathLength as number, totalPathLength)
        const spacing = progressToPixels(pathSpacing as number, totalPathLength)
        attrs[dashArrayKey] = `${length} ${spacing}`
    }

    return attrs
}

export function createBuildSVGAttrs() {
    const attrs: SVGAttrs = svgAttrsTemplate()
    const buildStyles = createBuildStyles()

    return (
        styles: Styles,
        opts: VisualElementOptions,
        dimensions: BoundingBox,
        pathLength: number = 0,
        isDashCase = true
    ) => {
        return buildSVGAttrs(
            attrs,
            styles,
            opts,
            buildStyles,
            dimensions,
            pathLength,
            isDashCase
        )
    }
}

function calcOrigin(origin: number | string, offset: number, size: number) {
    return typeof origin === "string"
        ? origin
        : (px as any).transform(offset + size * origin)
}

function calculateSVGTransformOrigin(
    dimensions: BoundingBox,
    originX: number | string,
    originY: number | string
) {
    originX = calcOrigin(originX, dimensions.y, dimensions.width)
    originY = calcOrigin(originY, dimensions.x, dimensions.height)
    return `${originX} ${originY}`
}

const svgAttrsTemplate = (): SVGAttrs => ({
    style: {},
})

const progressToPixels = (progress: number, length: number) => {
    // TODO: Fix casting
    return (px as any).transform(progress * length)
}

const noDimensions: BoundingBox = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
}

export const camelCaseAttributes = new Set([
    "baseFrequency",
    "diffuseConstant",
    "kernelMatrix",
    "kernelUnitLength",
    "keySplines",
    "keyTimes",
    "limitingConeAngle",
    "markerHeight",
    "markerWidth",
    "numOctaves",
    "targetX",
    "targetY",
    "surfaceScale",
    "specularConstant",
    "specularExponent",
    "stdDeviation",
    "tableValues",
])
