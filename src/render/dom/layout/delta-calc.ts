import { Axis, AxisDelta, BoxDelta, AxisBox2D } from "../../../types/geometry"
import { mix, progress, clamp, distance } from "@popmotion/popcorn"

const clampProgress = clamp(0, 1)

/**
 *
 */
export function isNear(value: number, target = 0, maxDistance = 0.01): boolean {
    return distance(value, target) < maxDistance
}

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
    delta.originPoint = mix(source.min, source.max, delta.origin)

    delta.scale = targetLength / sourceLength
    if (isNear(delta.scale, 1, 0.0001)) delta.scale = 1

    delta.translate = calcTranslate(source, target, delta.origin)
    if (isNear(delta.translate)) delta.translate = 0
}

/**
 *
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
