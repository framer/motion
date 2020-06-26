import { isNear } from "../../../motion/features/auto/utils"
import { Axis, AxisBox2D } from "../../../types/geometry"
import { progress, clamp, mix } from "@popmotion/popcorn"
import { AxisDelta, BoxDelta } from "../../../motion/features/auto/types"
import { HTMLVisualElement } from "../HTMLVisualElement"

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
 * Applies a `scale` to a `point` from the given `originPoint`.
 */
export function scalePoint({ scale, originPoint }: AxisDelta, point: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

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
 * Apple the translation and scale delta to a single point.
 */
export function applyPointDelta(point: number, delta: AxisDelta): number {
    return scalePoint(delta, point) + delta.translate
}

/**
 * Scale and translate both points on an axis.
 *
 * This is a mutative operation to avoid creating new objects every frame.
 */
export function applyAxisDelta(axis: Axis, delta: AxisDelta): void {
    axis.min = applyPointDelta(axis.min, delta)
    axis.max = applyPointDelta(axis.max, delta)
}

/**
 * Scale and translate both axis of a box.
 */
export function applyBoxDelta(box: AxisBox2D, delta: BoxDelta): void {
    applyAxisDelta(box.x, delta.x)
    applyAxisDelta(box.y, delta.y)
}

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
