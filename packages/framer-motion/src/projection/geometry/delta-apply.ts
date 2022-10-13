import { mix } from "popmotion"
import { ResolvedValues } from "../../render/types"
import { IProjectionNode, TreeDistortion } from "../node/types"
import { hasTransform } from "../utils/has-transform"
import { Axis, Box, Delta } from "./types"

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
export function applyBoxDelta(box: Box, { x, y }: Delta): void {
    applyAxisDelta(box.x, x.translate, x.scale, x.originPoint)
    applyAxisDelta(box.y, y.translate, y.scale, y.originPoint)
}

/**
 * Apply a tree of deltas to a box. We do this to calculate the effect of all the transforms
 * in a tree upon our box before then calculating how to project it into our desired viewport-relative box
 *
 * This is the final nested loop within updateLayoutDelta for future refactoring
 */
export function applyTreeDeltas(
    box: Box,
    treeScale: TreeDistortion,
    treePath: IProjectionNode[],
    isSharedTransition: boolean = false
) {
    const treeLength = treePath.length
    if (!treeLength) return

    // Reset the treeScale
    treeScale.x = treeScale.y = 1
    treeScale.rotate = 0

    let node: IProjectionNode
    let delta: Delta | undefined

    for (let i = 0; i < treeLength; i++) {
        node = treePath[i]
        delta = node.projectionDelta
        if ((node.instance as any)?.style?.display === "contents") continue

        const rotate = node.options.visualElement?.getStaticValue("rotate")
        if (rotate) {
            treeScale.rotate +=
                typeof rotate === "number" ? rotate : parseFloat(rotate)
        }

        if (
            isSharedTransition &&
            node.options.layoutScroll &&
            node.scroll &&
            node !== node.root
        ) {
            transformBox(box, { x: -node.scroll.x, y: -node.scroll.y })
        }

        if (delta) {
            // Incoporate each ancestor's scale into a culmulative treeScale for this component
            treeScale.x *= delta.x.scale
            treeScale.y *= delta.y.scale

            // Apply each ancestor's calculated delta into this component's recorded layout box
            applyBoxDelta(box, delta)
        }

        if (isSharedTransition && hasTransform(node.latestValues)) {
            transformBox(box, node.latestValues)
        }
    }
}

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
