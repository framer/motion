import { clamp, mix, progress, distance } from "@popmotion/popcorn"
import {
    Axis,
    AxisDelta,
    Snapshot,
    BoxDelta,
    Box,
    Style,
    MagicBatchTree,
    TransitionHandler,
} from "./types"
import { NativeElement } from "../../utils/use-native-element"
import { MotionStyle } from "../../types"
import { MotionValue } from "../../../value"
import { CustomValueType, Point } from "../../../types"
import { resolveMotionValue } from "../../../value/utils/resolve-motion-value"
import { Auto } from "./Auto"
import { warning } from "hey-listen"
import { MagicValueHandlers } from "./values"

const clampProgress = clamp(0, 1)

interface BoundingBox {
    top: number
    left: number
    bottom: number
    right: number
}

/**
 * If a bounding box is measured as 0 on either axis we encounter
 * divide by zero errors. We can prevent the actual errors by dividing by
 * an arbitrarily low amount, but then it's possible to see bugs where
 * child elements appear smeared across the screen. By setting each axis
 * to a non-zero measurement, the element itself will disappear (as you
 * can't invert scale: 0) but it will correctly animate back out, and it
 * fixes distortion on any children.
 */
function safeSize({ top, right, bottom, left }: BoundingBox): BoundingBox {
    const safePixels = 0.5

    if (top === bottom) {
        top -= safePixels
        bottom += safePixels
    }

    if (left === right) {
        left -= safePixels
        right += safePixels
    }

    return { top, right, bottom, left }
}

function snapshotLayout(
    element: NativeElement,
    transformPagePoint: (point: Point) => Point
) {
    const boundingBox = element.getBoundingBox()
    const { left, right, top, bottom } = safeSize(boundingBox)

    const topLeft = transformPagePoint({ x: left, y: top })
    const bottomRight = transformPagePoint({ x: right, y: bottom })

    return {
        x: { min: topLeft.x, max: bottomRight.x },
        y: { min: topLeft.y, max: bottomRight.y },
    }
}

function snapshotStyle(
    element: NativeElement,
    valueHandlers: MagicValueHandlers
): Style {
    const computedStyle = element.getComputedStyle()
    const style: Partial<Style> = {}

    for (const key in valueHandlers) {
        const handler = valueHandlers[key]

        if (handler.read === false) {
            continue
        } else if (handler.read) {
            style[key] = handler.read(computedStyle[key])
        } else {
            style[key] = computedStyle[key]
        }
    }

    warning(
        computedStyle.display !== "inline",
        "Magic components can't be display: inline, as inline elements don't accept a transform. Try inline-block instead."
    )

    return style as Style
}

export function snapshot(
    element: NativeElement,
    valueHandlers: MagicValueHandlers,
    transformPagePoint: (point: Point) => Point
): Snapshot {
    return {
        layout: snapshotLayout(element, transformPagePoint),
        style: snapshotStyle(element, valueHandlers),
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
    } else if (afterSize > beforeSize) {
        origin = progress(after.min, after.max - beforeSize, before.min)
    }

    return clampProgress(origin)
}

export function calcTreeScale(
    scale: { x: number; y: number },
    deltas: BoxDelta[]
): void {
    scale.x = scale.y = 1
    const numDeltas = deltas.length
    for (let i = 0; i < numDeltas; i++) {
        const delta = deltas[i]
        scale.x *= delta.x.scale
        scale.y *= delta.y.scale
    }
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

    //console.log(beforePoint, afterPoint, beforePoint - afterPoint)
    return beforePoint - afterPoint
}

export function scaledPoint({ scale, originPoint }: AxisDelta, point: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

export function calcDelta(
    delta: AxisDelta,
    before: Axis,
    after: Axis,
    origin?: number
): void {
    const beforeSize = before.max - before.min
    const afterSize = after.max - after.min

    delta.scale = beforeSize / afterSize
    delta.origin = origin !== undefined ? origin : calcOrigin(before, after)
    delta.originPoint = after.min + delta.origin * afterSize

    delta.translate = calcTranslate(before, after, delta.origin)

    // Clamp
    if (near(delta.scale, 1, 0.0001)) delta.scale = 1
    if (near(delta.translate)) delta.translate = 0
}

export function calcBoxDelta(
    delta: BoxDelta,
    before: Box,
    after: Box,
    origin?: number
): void {
    calcDelta(delta.x, before.x, after.x, origin)
    calcDelta(delta.y, before.y, after.y, origin)
}

export function applyDelta(point: number, delta: AxisDelta): number {
    return scaledPoint(delta, point) + delta.translate
}

export function applyAxisDelta(axis: Axis, delta: AxisDelta): void {
    axis.min = applyDelta(axis.min, delta)
    axis.max = applyDelta(axis.max, delta)
}

export function applyBoxDelta(box: Box, delta: BoxDelta): void {
    //console.log(box.x, delta.x)
    applyAxisDelta(box.x, delta.x)
    applyAxisDelta(box.y, delta.y)
}

export function applyTreeDeltas(box: Box, deltas: BoxDelta[]): void {
    const numDeltas = deltas.length

    for (let i = 0; i < numDeltas; i++) {
        applyBoxDelta(box, deltas[i])
    }
}

export function resolve<T extends unknown>(
    defaultValue: T,
    value?: MotionValue | string | number | CustomValueType
): T {
    return value === undefined ? defaultValue : (resolveMotionValue(value) as T)
}

/**
 * Reset `element.style` to ensure we're not reading styles that have previously been animated.
 * If anything is set in the incoming style prop, use that, otherwise unset to ensure the
 * underlying CSS is read.
 *
 * @param styleProp
 */
export function resetStyles(
    style: MotionStyle,
    valueHandlers: MagicValueHandlers
): MotionStyle {
    const reset: MotionStyle = {
        x: 0,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
    }

    // TODO: We need to resolve MotionValues
    for (const key in valueHandlers) {
        const handler = valueHandlers[key]

        if (style[key] !== undefined) {
            reset[key] = style[key]
        } else if (handler.reset) {
            reset[key] = handler.reset(style)
        } else {
            reset[key] = ""
        }
    }

    // if (offsetSnapshot) {
    //     Object.assign(reset, offsetSnapshot, { position: "absolute" })
    // }

    return reset
}

export function applyCurrent(style: Style, current: Partial<Style>) {
    for (const key in current) {
        style[key] = current[key]
    }
}

export const zeroDelta: AxisDelta = {
    translate: 0,
    scale: 1,
    origin: 0,
    originPoint: 0,
}

function easeAxis(
    axis: "x" | "y",
    target: Box,
    prev: Box,
    next: Box,
    p: number
) {
    target[axis].min = mix(prev[axis].min, next[axis].min, p)
    target[axis].max = mix(prev[axis].max, next[axis].max, p)
}

export function easeBox(target: Box, prev: Box, next: Box, p: number) {
    easeAxis("x", target, prev, next, p)
    easeAxis("y", target, prev, next, p)
}

const defaultHandler: TransitionHandler = {
    snapshotTarget: child => child.snapshotTarget(),
    startAnimation: child => child.startAnimation(),
}

export const batchTransitions = (): MagicBatchTree => {
    const queue = new Set<Auto>()

    const add = (child: Auto) => queue.add(child)

    const flush = ({
        snapshotTarget,
        startAnimation,
    }: TransitionHandler = defaultHandler) => {
        if (!queue.size) return

        const order = Array.from(queue).sort(sortByDepth)

        order.forEach(child => child.resetStyles())
        order.forEach(snapshotTarget)
        order.forEach(startAnimation)

        queue.clear()
    }

    return { add, flush }
}

const sortByDepth = (a: Auto, b: Auto) => a.depth - b.depth

export function near(value: number, target = 0, maxDistance = 0.01): boolean {
    return distance(value, target) < maxDistance
}

// Replace with code from Stylefire
const CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g
const REPLACE_TEMPLATE = "$1-$2"
export const camelToDash = (str: string) =>
    str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase()
