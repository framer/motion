import { px } from "style-value-types"
import { Dimensions } from "../types"

function calcOrigin(origin: number | string, offset: number, size: number) {
    return typeof origin === "string"
        ? origin
        : (px as any).transform(offset + size * origin)
}

export function calcSVGTransformOrigin(
    dimensions: Dimensions,
    originX: number | string,
    originY: number | string
) {
    const pxOriginX = calcOrigin(originX, dimensions.x, dimensions.width)
    const pxOriginY = calcOrigin(originY, dimensions.y, dimensions.height)
    return `${pxOriginX} ${pxOriginY}`
}
