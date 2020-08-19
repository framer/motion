import { Point2D, Axis, AxisBox2D, BoxDelta } from "../../../types/geometry"
import { complex, px } from "style-value-types"
import { mix } from "popmotion"

type ScaleCorrection = (
    latest: string | number,
    viewportBox: AxisBox2D,
    delta: BoxDelta,
    treeScale: Point2D
) => string | number

interface ScaleCorrectionDefinition {
    process: ScaleCorrection
    applyTo?: string[]
}

type ScaleCorrectionDefinitionMap = {
    [key: string]: ScaleCorrectionDefinition
}

export function pixelsToPercent(pixels: number, axis: Axis): number {
    return (pixels / (axis.max - axis.min)) * 100
}

/**
 * We always correct borderRadius as a percentage rather than pixels to reduce paints.
 * For example, if you are projecting a box that is 100px wide with a 10px borderRadius
 * into a box that is 200px wide with a 20px borderRadius, that is actually a 10%
 * borderRadius in both states. If we animate between the two in pixels that will trigger
 * a paint each time. If we animate between the two in percentage we'll avoid a paint.
 */
export function correctBorderRadius(
    latest: string | number,
    viewportBox: AxisBox2D
) {
    /**
     * If latest is a string, if it's a percentage we can return immediately as it's
     * going to be stretched appropriately. Otherwise, if it's a pixel, convert it to a number.
     */
    if (typeof latest === "string") {
        if (px.test(latest)) {
            latest = parseFloat(latest)
        } else {
            return latest
        }
    }

    /**
     * If latest is a number, it's a pixel value. We use the current viewportBox to calculate that
     * pixel value as a percentage of each axis
     */
    const x = pixelsToPercent(latest, viewportBox.x)
    const y = pixelsToPercent(latest, viewportBox.y)

    return `${x}% ${y}%`
}

type BoxShadow = [string, number, number, number, number]

export function correctBoxShadow(
    latest: string,
    _viewportBox: AxisBox2D,
    delta: BoxDelta,
    treeScale: Point2D
) {
    // GC Warning - this creates a function and object every frame
    const shadow = complex.parse(latest) as BoxShadow
    const template = complex.createTransformer(latest)

    // Calculate the overall context scale
    const xScale = delta.x.scale * treeScale.x
    const yScale = delta.y.scale * treeScale.y

    // Scale x/y
    shadow[1] /= xScale
    shadow[2] /= yScale

    /**
     * Ideally we'd correct x and y scales individually, but because blur and
     * spread apply to both we have to take a scale average and apply that instead.
     * We could potentially improve the outcome of this by incorporating the ratio between
     * the two scales.
     */
    const averageScale = mix(xScale, yScale, 0.5)

    // Blur
    if (typeof shadow[3] === "number") shadow[3] /= averageScale

    // Spread
    if (typeof shadow[4] === "number") shadow[4] /= averageScale

    return template(shadow as any)
}

const borderCorrectionDefinition = {
    process: correctBorderRadius,
}

export const valueScaleCorrection: ScaleCorrectionDefinitionMap = {
    borderRadius: {
        ...borderCorrectionDefinition,
        applyTo: [
            "borderTopLeftRadius",
            "borderTopRightRadius",
            "borderBottomLeftRadius",
            "borderBottomRightRadius",
        ],
    },
    borderTopLeftRadius: borderCorrectionDefinition,
    borderTopRightRadius: borderCorrectionDefinition,
    borderBottomLeftRadius: borderCorrectionDefinition,
    borderBottomRightRadius: borderCorrectionDefinition,
    boxShadow: {
        process: correctBoxShadow,
    },
}

/**
 * @internal
 */
export function addScaleCorrection(correctors: ScaleCorrectionDefinitionMap) {
    for (const key in correctors) {
        valueScaleCorrection[key] = correctors[key]
    }
}
