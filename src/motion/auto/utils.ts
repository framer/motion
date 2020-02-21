import { clamp, mix, progress } from "@popmotion/popcorn"
import { Axis, AxisDelta, Snapshot, BoxDelta, Box } from "./types"
import { NativeElement } from "../utils/use-native-element"

const clampProgress = clamp(0, 1)

export function snapshot(element: NativeElement): Snapshot {
    const { top, left, right, bottom } = element.getBoundingBox()
    const {
        backgroundColor,
        borderRadius,
        color,
        opacity,
    } = element.getComputedStyle()

    return {
        layout: {
            x: { min: left, max: right },
            y: { min: top, max: bottom },
        },
        style: {
            backgroundColor,
            borderRadius: borderRadius ? parseFloat(borderRadius) : 0,
            color: color || "",
            opacity: opacity ? parseFloat(opacity) : 0,
        },
    }
}

/**
 * Calculate an appropriate transform origin for this delta.
 *
 * If components don't change size, it isn't really relavent what origin we provide.
 * When a component is scaling, we want to generate a visually appeasing transform origin and allow
 * the component to scale out (or in) from there. This means 0 for components whose left edge
 * is the same or beyond the `before`, 1 for the inverse, and 0-1 for in between.
 *
 * @param before
 * @param after
 */
export function calcOrigin(before: Axis, after: Axis): number {
    let origin = 0.5
    const beforeSize = before.max - before.min
    const afterSize = after.max - after.min

    if (beforeSize > afterSize) {
        origin = progress(before.min, before.max - afterSize, after.min)
    } else {
        origin = progress(after.min, after.max - beforeSize, before.min)
    }

    return clampProgress(origin)
}

/**
 *
 * @param before
 * @param after
 * @param origin
 */
export function calcTranslate(
    before: Axis,
    after: Axis,
    origin: number
): number {
    const beforePoint = mix(before.min, before.max, origin)
    const afterPoint = mix(after.min, after.max, origin)
    return beforePoint - afterPoint
}

export function scaledPoint({ scale, originPoint }: AxisDelta, point: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

export function calcDelta(before: Axis, after: Axis): AxisDelta {
    const beforeSize = before.max - before.min
    const afterSize = after.max - after.min

    const scale = beforeSize / afterSize
    const origin = calcOrigin(before, after)
    const originPoint = after.min + origin * afterSize
    const translate = calcTranslate(before, after, origin)

    return { scale, translate, origin, originPoint }
}

export function calcBoxDelta(before: Box, after: Box) {
    return {
        x: calcDelta(before.x, after.x),
        y: calcDelta(before.y, after.y),
    }
}

export function applyDelta(delta: AxisDelta, axis: Axis) {
    let min = axis.min
    let max = axis.max

    min = scaledPoint(delta, axis.min) + delta.translate
    max = scaledPoint(delta, axis.max) + delta.translate

    return { min, max }
}

export function applyBoxDelta(delta: BoxDelta, box: Box) {
    return {
        x: applyDelta(delta.x, box.x),
        y: applyDelta(delta.y, box.y),
    }
}

export function applyTreeDeltas(deltas: BoxDelta[], box: Box): Box {
    const numDeltas = deltas.length

    for (let i = 0; i < numDeltas; i++) {
        box = applyBoxDelta(deltas[i], box)
    }

    return box
}
