import { Axis, AxisDelta, BoxDelta, AxisBox2D } from "../../types/geometry"
import { mix, progress, clamp, distance } from "@popmotion/popcorn"

const clampProgress = clamp(0, 1)

/**
 * Returns true if the provided value is within maxDistance of the provided target
 */
export function isNear(value: number, target = 0, maxDistance = 0.01): boolean {
    return distance(value, target) < maxDistance
}

/**
 * Calculate the translate needed to be applied to source to get target
 */
export function calcTranslate(
    source: Axis,
    target: Axis,
    origin: number
): number {
    const sourcePoint = mix(source.min, source.max, origin)
    const targetPoint = mix(target.min, target.max, origin)

    return targetPoint - sourcePoint
}

/**
 * Calculate a transform origin relative to the source axis, between 0-1, that results
 * in an asthetically pleasing scale/transform needed to project from source to target.
 */
export function calcOrigin(source: Axis, target: Axis): number {
    let origin = 0.5
    const sourceLength = source.max - source.min
    const targetLength = target.max - target.min

    if (targetLength > sourceLength) {
        origin = progress(target.min, target.max - sourceLength, source.min)
    } else if (sourceLength > targetLength) {
        origin = progress(source.min, source.max - targetLength, target.min)
    }

    return clampProgress(origin)
}

/**
 * Update the AxisDelta with a transform that projects source into target.
 *
 * The transform `origin` is optional. If not provided, it'll be automatically
 * calculated based on the relative positions of the two bounding boxes.
 */
export function updateAxisDelta(
    delta: AxisDelta,
    source: Axis,
    target: Axis,
    origin?: number
) {
    const sourceLength = source.max - source.min
    const targetLength = target.max - target.min

    delta.origin = origin === undefined ? calcOrigin(source, target) : origin
    delta.originPoint = mix(source.min, source.max, delta.origin)

    delta.scale = targetLength / sourceLength
    if (isNear(delta.scale, 1, 0.0001)) delta.scale = 1

    delta.translate = calcTranslate(source, target, delta.origin)
    if (isNear(delta.translate)) delta.translate = 0
}

/**
 * Update the BoxDelta with a transform that projects the source into the target.
 *
 * The transform `origin` is optional. If not provided, it'll be automatically
 * calculated based on the relative positions of the two bounding boxes.
 */
export function updateBoxDelta(
    delta: BoxDelta,
    source: AxisBox2D,
    target: AxisBox2D,
    origin?: number
): void {
    updateAxisDelta(delta.x, source.x, target.x, origin)
    updateAxisDelta(delta.y, source.y, target.y, origin)
}

/**
 * Update the treeScale by incorporating the parent's latest scale into its treeScale.
 */
export function updateTreeScale(
    treeScale: Point2D,
    parentTreeScale: Point2D,
    parentDelta: BoxDelta
) {
    treeScale.x = parentTreeScale.x * parentDelta.x.scale
    treeScale.y = parentTreeScale.y * parentDelta.y.scale
}
