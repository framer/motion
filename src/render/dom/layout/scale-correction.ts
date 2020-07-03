import { Point2D, Axis, AxisBox2D, BoxDelta } from "../../../types/geometry"
import { percent, complex } from "style-value-types"
import { mix } from "@popmotion/popcorn"

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

function convertAxisPercentToPixels(latest: number, axis: Axis) {
    const factor = latest / 100
    return factor * (axis.max - axis.min)
}

export function convertPercentToPixels(latest: number, viewportBox: AxisBox2D) {
    const x = convertAxisPercentToPixels(latest, viewportBox.x)
    const y = convertAxisPercentToPixels(latest, viewportBox.y)
    return `${x}px ${y}px`
}

export function correctBorderRadius(
    latest: string | number,
    viewportBox: AxisBox2D,
    delta: BoxDelta,
    treeScale: Point2D
) {
    let x = 0
    let y = 0

    // TODO: Always calculate radius as a percentage to reduce unncessary repaints
    if (typeof latest === "string") {
        // TODO: Double check we actually need to do anything with percentages
        if (percent.test(latest)) {
            // If this is a percentage, convert it to pixels using the latest viewport box
            const percentAsNumber = percent.parse(latest)
            x = convertAxisPercentToPixels(percentAsNumber, viewportBox.x)
            y = convertAxisPercentToPixels(percentAsNumber, viewportBox.y)
        } else {
            // If this isn't a percentage, it isn't currently supported
            return latest
        }
    } else {
        x = y = latest
    }

    // Perform scale correction
    x = x / delta.x.scale / treeScale.x
    y = y / delta.y.scale / treeScale.y

    return `${x}px ${y}px`
}

export function correctBoxShadow(
    latest: string,
    delta: BoxDelta,
    treeScale: Point2D
) {
    // GC Warning - this creates a function and object every frame
    const shadow = complex.parse(latest)
    const template = complex.createTransformer(latest)

    /**
     * Ideally we'd correct x and y scales individually, but because blur and
     * spread apply to both we have to take a scale average and apply that instead.
     * We could potentially improve the outcome of this by incorporating the ratio between
     * the two scales.
     */
    const averageScale = mix(
        delta.x.scale / treeScale.x,
        delta.y.scale / treeScale.y,
        0.5
    )

    // Blur
    if (typeof shadow[3] === "number") {
        shadow[3] = shadow[3] / averageScale
    }

    // Spread
    if (typeof shadow[4] === "number") {
        shadow[4] = shadow[4] / averageScale
    }

    return template(shadow)
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
