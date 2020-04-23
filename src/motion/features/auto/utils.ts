import { clamp, mix, progress, distance } from "@popmotion/popcorn"
import { Axis, AxisDelta, Snapshot, BoxDelta, Box, Style } from "./types"
import {
    SharedBatchTree,
    TransitionHandler,
} from "../../../components/AnimateSharedLayout/types"
import { NativeElement } from "../../utils/use-native-element"
import { MotionStyle } from "../../types"
import { MotionValue } from "../../../value"
import { CustomValueType, Point } from "../../../types"
import { resolveMotionValue } from "../../../value/utils/resolve-motion-value"
import { Auto, SharedLayoutTree } from "./Auto"
import { warning } from "hey-listen"
import { AutoValueHandlers } from "./values"

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
export function safeSize({
    top,
    right,
    bottom,
    left,
}: BoundingBox): BoundingBox {
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
    valueHandlers: AutoValueHandlers
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
    valueHandlers: AutoValueHandlers,
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

/**
 * Calculate a translation value that, if applied to `after` with the given
 * `origin`, would return `before`
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

/**
 * Applies a `scale` to a `point` from the given `originPoint`.
 */
export function scaledPoint({ scale, originPoint }: AxisDelta, point: number) {
    const distanceFromOrigin = point - originPoint
    const scaled = scale * distanceFromOrigin
    return originPoint + scaled
}

/**
 * Calculate a transform delta that, if applied to `after`, will
 * create `before`.
 *
 * The transform `origin` is optional. If not provided, it'll be automatically
 * calculated based on the relative positions of the two bounding boxes.
 *
 * This is a mutative operation to avoid creating new objects every frame.
 */
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
    if (isNear(delta.scale, 1, 0.0001)) delta.scale = 1
    if (isNear(delta.translate)) delta.translate = 0
}

/**
 * Calculate a transform delta between before and after.
 *
 * This is a mutative operation to avoid creating new objects every frame.
 */
export function calcBoxDelta(
    delta: BoxDelta,
    before: Box,
    after: Box,
    origin?: number
): void {
    calcDelta(delta.x, before.x, after.x, origin)
    calcDelta(delta.y, before.y, after.y, origin)
}

/**
 * Apple the translation and scale delta to a single point.
 */
export function applyDelta(point: number, delta: AxisDelta): number {
    return scaledPoint(delta, point) + delta.translate
}

/**
 * Scale and translate both points on an axis.
 *
 * This is a mutative operation to avoid creating new objects every frame.
 */
export function applyAxisDelta(axis: Axis, delta: AxisDelta): void {
    axis.min = applyDelta(axis.min, delta)
    axis.max = applyDelta(axis.max, delta)
}

/**
 * Scale and translate both axis of a box.
 */
export function applyBoxDelta(box: Box, delta: BoxDelta): void {
    applyAxisDelta(box.x, delta.x)
    applyAxisDelta(box.y, delta.y)
}

/**
 * Apply a whole tree of deltas to a box. Along the way, keep track of the
 * resultant scale of the tree.
 *
 * This is a mutative operation to avoid creating new objects every frame.
 */
export function applyTreeDeltas(
    box: Box,
    treeScale: { x: number; y: number },
    deltas: BoxDelta[]
): void {
    const numDeltas = deltas.length
    treeScale.x = treeScale.y = 1

    for (let i = 0; i < numDeltas; i++) {
        const delta = deltas[i]
        applyBoxDelta(box, delta)
        treeScale.x *= delta.x.scale
        treeScale.y *= delta.y.scale
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
    valueHandlers: AutoValueHandlers
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

/**
 * Apply the saved current styles to the provided style object.
 */
export function applyCurrent(style: Style, current: Partial<Style>) {
    for (const key in current) {
        style[key] = current[key]
    }
}

/**
 * An object representing a zero or neutral delta. Applying this as a
 * transform would leave a bounding box unchanged.
 */
export const zeroDelta: AxisDelta = {
    translate: 0,
    scale: 1,
    origin: 0,
    originPoint: 0,
}

/**
 * Tween a single axis between two bounding boxes.
 *
 * This is a mutative operation.
 */
function tweenAxis(
    axis: "x" | "y",
    target: Box,
    prev: Box,
    next: Box,
    p: number
) {
    target[axis].min = mix(prev[axis].min, next[axis].min, p)
    target[axis].max = mix(prev[axis].max, next[axis].max, p)
}

/**
 * Tween between two bounding boxes.
 *
 * This is a mutative operation.
 */
export function tweenBox(target: Box, prev: Box, next: Box, p: number) {
    tweenAxis("x", target, prev, next, p)
    tweenAxis("y", target, prev, next, p)
}

const defaultHandler: TransitionHandler = {
    snapshotTarget: child => child.snapshotTarget(),
    startAnimation: child => child.startAnimation(),
}

export const batchTransitions = (): SharedBatchTree => {
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

export function isNear(value: number, target = 0, maxDistance = 0.01): boolean {
    return distance(value, target) < maxDistance
}

/**
 * Check if the provided context is the SharedLayoutContext default
 * or if we're the child of an AnimateSharedLayout component.
 */
export function isSharedLayoutTree(
    context: SharedLayoutTree | SharedBatchTree
): context is SharedLayoutTree {
    return !!(context as SharedLayoutTree).register
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
export function resetBox(box: Box, originBox: Box) {
    resetAxis(box.x, originBox.x)
    resetAxis(box.y, originBox.y)
}

/**
 * Look up the tree to check whether we're in a visible portion
 * of the tree. If we're not, we can optimise away this animation.
 */
export function isTreeVisible(deltas: BoxDelta[]): boolean {
    let isVisible = true
    const numDeltas = deltas.length
    for (let i = 0; i < numDeltas; i++) {
        if (!deltas[i].isVisible) {
            isVisible = false
            continue
        }
    }

    return isVisible
}

/**
 * Detect which automatically animatable values don't need scale correction and can be animated normally.
 */
export function getAnimatableValues(
    supportedAutoValues: AutoValueHandlers
): string[] {
    return Object.keys(supportedAutoValues).filter(
        key => !supportedAutoValues[key].createUpdater
    )
}
