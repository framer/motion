import { Axis, AxisDelta, BoxDelta, AxisBox2D } from "../../types/geometry"
import { mix, distance, progress, clamp } from "popmotion"
import { ResolvedValues } from "../../render/types"

const clampProgress = (v: number) => clamp(0, 1, v)

/**
 * Returns true if the provided value is within maxDistance of the provided target
 */
export function isNear(value: number, target = 0, maxDistance = 0.01): boolean {
    return distance(value, target) < maxDistance
}

function calcLength(axis: Axis) {
    return axis.max - axis.min
}

/**
 * Calculate a transform origin relative to the source axis, between 0-1, that results
 * in an asthetically pleasing scale/transform needed to project from source to target.
 */
export function calcOrigin(source: Axis, target: Axis): number {
    let origin = 0.5
    const sourceLength = calcLength(source)
    const targetLength = calcLength(target)

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
    origin: number = 0.5
) {
    delta.origin = origin
    delta.originPoint = mix(source.min, source.max, delta.origin)

    delta.scale = calcLength(target) / calcLength(source)
    if (isNear(delta.scale, 1, 0.0001)) delta.scale = 1

    delta.translate =
        mix(target.min, target.max, delta.origin) - delta.originPoint
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
    origin: ResolvedValues
): void {
    updateAxisDelta(delta.x, source.x, target.x, defaultOrigin(origin.originX))
    updateAxisDelta(delta.y, source.y, target.y, defaultOrigin(origin.originY))
}

/**
 * Currently this only accepts numerical origins, measured as 0-1, but could
 * accept pixel values by comparing to the target axis.
 */
function defaultOrigin(origin: number | string | null) {
    return typeof origin === "number" ? origin : 0.5
}
