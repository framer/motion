import { MotionValue } from "../../../value"
import { isNear } from "../../../motion/features/auto/utils"
import { Axis, AxisBox2D } from "../../../types/geometry"
import { progress, clamp, mix } from "@popmotion/popcorn"
import { AxisDelta, BoxDelta } from "../../../motion/features/auto/types"

const clampProgress = clamp(0, 1)

/**
 *
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
 *
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
 *
 */
export function calcOriginPoint(
    point: number,
    length: number,
    origin: number
): number {
    return point + origin * length
}

/**
 * Update the MotionAxisDelta with a transform that projects source into target.
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
    delta.originPoint = calcOriginPoint(source.min, sourceLength, delta.origin)

    delta.scale = targetLength / sourceLength
    delta.translate = calcTranslate(source, target, delta.origin)

    // Clamp
    if (isNear(delta.scale, 1, 0.0001)) delta.scale = 1
    if (isNear(delta.translate)) delta.translate = 0
}

export function undoAxisTransform(source: Axis, delta: AxisDelta) {
    source.min -= delta.translate
    source.max -= delta.translate
}

/**
 * TODO: This needs to accomodate
 * - tree delta
 * - additional scale transform
 */
export function undoTransform(source: AxisBox2D, delta: BoxDelta): void {
    undoAxisTransform(source.x, delta.x)
    undoAxisTransform(source.y, delta.y)
}
