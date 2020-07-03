import { Axis, AxisBox2D, BoxDelta } from "../../../types/geometry"
import { mix } from "@popmotion/popcorn"
import { HTMLVisualElement } from "../HTMLVisualElement"
import { ResolvedValues } from "../../types"

/**
 * Reset an axis to the provided origin box.
 *
 * This is a mutative operation.
 */
function resetAxis(axis: Axis, originAxis: Axis) {
    axis.min = originAxis.min
    axis.max = originAxis.max
}

/**
 * Reset a box to the provided origin box.
 *
 * This is a mutative operation.
 */
export function resetBox(box: AxisBox2D, originBox: AxisBox2D) {
    resetAxis(box.x, originBox.x)
    resetAxis(box.y, originBox.y)
}

/**
 *
 */
export function scalePoint(point: number, scale: number, originPoint: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

/**
 *
 */
export function applyPointDelta(
    point: number,
    translate: number,
    scale: number,
    originPoint: number,
    boxScale?: number
): number {
    if (boxScale !== undefined) {
        point = scalePoint(point, boxScale, originPoint)
    }

    return scalePoint(point, scale, originPoint) + translate
}

export function applyAxisDelta(
    axis: Axis,
    translate: number = 0,
    scale: number = 1,
    originPoint: number,
    boxScale?: number
): void {
    axis.min = applyPointDelta(
        axis.min,
        translate,
        scale,
        originPoint,
        boxScale
    )
    axis.max = applyPointDelta(
        axis.max,
        translate,
        scale,
        originPoint,
        boxScale
    )
}

/**
 * Scale and translate both axis of a box.
 */
export function applyBoxDelta(box: AxisBox2D, { x, y }: BoxDelta): void {
    applyAxisDelta(box.x, x.translate, x.scale, x.originPoint)
    applyAxisDelta(box.y, y.translate, y.scale, y.originPoint)
}

/**
 *
 */
export function applyAxisTransforms(
    final: Axis,
    axis: Axis,
    transforms: ResolvedValues,
    [key, scaleKey, originKey]: string[]
): void {
    // Copy the current axis to the final axis before mutation
    final.min = axis.min
    final.max = axis.max

    const originPoint = mix(
        axis.min,
        axis.max,
        (transforms[originKey] as number) || 0.5
    )

    // Apply the axis delta to the final axis
    applyAxisDelta(
        final,
        transforms[key] as number,
        transforms[scaleKey] as number,
        originPoint,
        transforms.scale as number
    )
}

/**
 *
 */
const xKeys = ["x", "scaleX", "originX"]
const yKeys = ["y", "scaleY", "originY"]

/**
 *
 */
export function applyBoxTransforms(
    finalBox: AxisBox2D,
    box: AxisBox2D,
    transforms: ResolvedValues
): void {
    applyAxisTransforms(finalBox.x, box.x, transforms, xKeys)
    applyAxisTransforms(finalBox.y, box.y, transforms, yKeys)
}

export function removePointDelta(
    point: number,
    translate: number,
    scale: number,
    originPoint: number,
    boxScale?: number
): number {
    point -= translate
    point = scalePoint(point, 1 / scale, originPoint)

    if (boxScale !== undefined) {
        point = scalePoint(point, 1 / boxScale, originPoint)
    }

    return point
}

export function removeAxisDelta(
    axis: Axis,
    translate: number = 0,
    scale: number = 1,
    origin: number = 0.5,
    boxScale?: number
): void {
    const originPoint = mix(axis.min, axis.max, origin)

    axis.min = removePointDelta(
        axis.min,
        translate,
        scale,
        originPoint,
        boxScale
    )
    axis.max = removePointDelta(
        axis.max,
        translate,
        scale,
        originPoint,
        boxScale
    )
}

export function removeAxisTransforms(
    axis: Axis,
    transforms: ResolvedValues,
    [key, scaleKey, originKey]: string[]
) {
    const originPoint = mix(
        axis.min,
        axis.max,
        (transforms[originKey] as number) || 0.5
    )
    applyAxisDelta(
        axis,
        transforms[key] as number,
        transforms[scaleKey] as number,
        originPoint,
        transforms.scale as number
    )
}

/**
 *
 */
export function removeBoxTransforms(
    box: AxisBox2D,
    transforms: ResolvedValues
): void {
    removeAxisTransforms(box.x, transforms, xKeys)
    removeAxisTransforms(box.y, transforms, yKeys)
}

/**
 *
 */
export function applyTreeDeltas(
    box: AxisBox2D,
    treeScale: { x: number; y: number },
    treePath: HTMLVisualElement[]
) {
    treeScale.x = treeScale.y = 1

    const treeLength = treePath.length
    for (let i = 0; i < treeLength; i++) {
        const parent = treePath[i]
        const delta = parent.delta
        applyBoxDelta(box, delta)
        treeScale.x *= delta.x.scale
        treeScale.y *= delta.y.scale
    }
}
