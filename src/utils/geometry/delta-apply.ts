import { Axis, AxisBox2D, BoxDelta, Point2D } from "../../types/geometry"
import { mix } from "popmotion"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"
import { ResolvedValues } from "../../render/VisualElement/types"

/**
 * Reset an axis to the provided origin box.
 *
 * This is a mutative operation.
 */
export function resetAxis(axis: Axis, originAxis: Axis) {
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
 * Scales a point based on a factor and an originPoint
 */
export function scalePoint(point: number, scale: number, originPoint: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

/**
 * Applies a translate/scale delta to a point
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

/**
 * Applies a translate/scale delta to an axis
 */
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
 * Applies a translate/scale delta to a box
 */
export function applyBoxDelta(box: AxisBox2D, { x, y }: BoxDelta): void {
    applyAxisDelta(box.x, x.translate, x.scale, x.originPoint)
    applyAxisDelta(box.y, y.translate, y.scale, y.originPoint)
}

/**
 * Apply a transform to an axis from the latest resolved motion values.
 * This function basically acts as a bridge between a flat motion value map
 * and applyAxisDelta
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

    const axisOrigin =
        transforms[originKey] !== undefined ? transforms[originKey] : 0.5

    const originPoint = mix(axis.min, axis.max, axisOrigin as number)

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
 * The names of the motion values we want to apply as translation, scale and origin.
 */
const xKeys = ["x", "scaleX", "originX"]
const yKeys = ["y", "scaleY", "originY"]

/**
 * Apply a transform to a box from the latest resolved motion values.
 */
export function applyBoxTransforms(
    finalBox: AxisBox2D,
    box: AxisBox2D,
    transforms: ResolvedValues
): void {
    applyAxisTransforms(finalBox.x, box.x, transforms, xKeys)
    applyAxisTransforms(finalBox.y, box.y, transforms, yKeys)
}

/**
 * Remove a delta from a point. This is essentially the steps of applyPointDelta in reverse
 */
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

/**
 * Remove a delta from an axis. This is essentially the steps of applyAxisDelta in reverse
 */
export function removeAxisDelta(
    axis: Axis,
    translate: number = 0,
    scale: number = 1,
    origin: number = 0.5,
    boxScale?: number
): void {
    const originPoint = mix(axis.min, axis.max, origin) - translate

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

/**
 * Remove a transforms from an axis. This is essentially the steps of applyAxisTransforms in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
export function removeAxisTransforms(
    axis: Axis,
    transforms: ResolvedValues,
    [key, scaleKey, originKey]: string[]
) {
    removeAxisDelta(
        axis,
        transforms[key] as number,
        transforms[scaleKey] as number,
        transforms[originKey] as number,
        transforms.scale as number
    )
}

/**
 * Remove a transforms from an box. This is essentially the steps of applyAxisBox in reverse
 * and acts as a bridge between motion values and removeAxisDelta
 */
export function removeBoxTransforms(
    box: AxisBox2D,
    transforms: ResolvedValues
): void {
    removeAxisTransforms(box.x, transforms, xKeys)
    removeAxisTransforms(box.y, transforms, yKeys)
}

/**
 * Apply a tree of deltas to a box. We do this to calculate the effect of all the transforms
 * in a tree upon our box before then calculating how to project it into our desired viewport-relative box
 *
 * This is the final nested loop within HTMLVisualElement.updateLayoutDelta
 */
export function applyTreeDeltas(
    box: AxisBox2D,
    treeScale: Point2D,
    treePath: HTMLVisualElement[]
) {
    const treeLength = treePath.length
    if (!treeLength) return

    // Reset the treeScale
    treeScale.x = treeScale.y = 1

    for (let i = 0; i < treeLength; i++) {
        const { delta } = treePath[i]

        // Incoporate each ancestor's scale into a culmulative treeScale for this component
        treeScale.x *= delta.x.scale
        treeScale.y *= delta.y.scale

        // Apply each ancestor's calculated delta into this component's recorded layout box
        applyBoxDelta(box, delta)
    }
}
