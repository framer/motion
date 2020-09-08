import { Point2D, Axis, AxisBox2D, BoxDelta } from "../../../types/geometry"
import { cssVariableRegex } from "../utils/css-variables-conversion"
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

const varToken = "_$css"

export function correctBoxShadow(
    latest: string,
    _viewportBox: AxisBox2D,
    delta: BoxDelta,
    treeScale: Point2D
) {
    const original = latest

    /**
     * We need to first strip and store CSS variables from the string.
     */
    const containsCSSVariables = latest.includes("var(")
    const cssVariables: string[] = []
    if (containsCSSVariables) {
        latest = latest.replace(cssVariableRegex, (match) => {
            cssVariables.push(match)
            return varToken
        })
    }

    const shadow = complex.parse(latest)

    // TODO: Doesn't support multiple shadows
    if (shadow.length > 5) return original

    const template = complex.createTransformer(latest)
    const offset = typeof shadow[0] !== "number" ? 1 : 0

    // Calculate the overall context scale
    const xScale = delta.x.scale * treeScale.x
    const yScale = delta.y.scale * treeScale.y

    // Scale x/y
    ;(shadow[0 + offset] as number) /= xScale
    ;(shadow[1 + offset] as number) /= yScale

    /**
     * Ideally we'd correct x and y scales individually, but because blur and
     * spread apply to both we have to take a scale average and apply that instead.
     * We could potentially improve the outcome of this by incorporating the ratio between
     * the two scales.
     */
    const averageScale = mix(xScale, yScale, 0.5)

    // Blur
    if (typeof shadow[2 + offset] === "number")
        (shadow[2 + offset] as number) /= averageScale

    // Spread
    if (typeof shadow[3 + offset] === "number")
        (shadow[3 + offset] as number) /= averageScale

    let output = template(shadow)

    if (containsCSSVariables) {
        let i = 0
        output = output.replace(varToken, () => {
            const cssVariable = cssVariables[i]
            i++
            return cssVariable
        })
    }

    return output
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
