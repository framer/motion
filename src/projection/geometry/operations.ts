import { mix } from "popmotion"
import { ResolvedValues } from "../../render/types"
import { applyAxisDelta } from "./delta-apply"
import { Axis, Box } from "./types"

export function translateAxis(axis: Axis, distance: number) {
    axis.min = axis.min + distance
    axis.max = axis.max + distance
}

/**
 * Apply a transform to an axis from the latest resolved motion values.
 * This function basically acts as a bridge between a flat motion value map
 * and applyAxisDelta
 */
export function transformAxis(
    axis: Axis,
    transforms: ResolvedValues,
    [key, scaleKey, originKey]: string[]
): void {
    const axisOrigin =
        transforms[originKey] !== undefined ? transforms[originKey] : 0.5

    const originPoint = mix(axis.min, axis.max, axisOrigin as number)

    // Apply the axis delta to the final axis
    applyAxisDelta(
        axis,
        transforms[key] as number,
        transforms[scaleKey] as number,
        originPoint,
        transforms.scale as number
    )
}

/**
 * The names of the motion values we want to apply as translation, scale and origin.
 */
const xKeys = ["x", "scaleX", "originX"]
const yKeys = ["y", "scaleY", "originY"]

/**
 * Apply a transform to a box from the latest resolved motion values.
 */
export function transformBox(box: Box, transform: ResolvedValues) {
    transformAxis(box.x, transform, xKeys)
    transformAxis(box.y, transform, yKeys)
}
