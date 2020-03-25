import { clamp, mix, progress, distance } from "@popmotion/popcorn"
import {
    Axis,
    AxisDelta,
    Snapshot,
    BoxDelta,
    Box,
    Style,
    MagicBatchTree,
    StackQuery,
    MagicAnimationOptions,
} from "./types"
import { NativeElement } from "../utils/use-native-element"
import { MotionStyle } from "../types"
import { MotionValue } from "../../value"
import { CustomValueType } from "../../types"
import { resolveMotionValue } from "../../value/utils/resolve-motion-value"
import { Magic } from "./Magic"
import { warning } from "hey-listen"

const clampProgress = clamp(0, 1)

export function snapshot(element: NativeElement): Snapshot {
    const { top, left, right, bottom } = element.getBoundingBox()
    const {
        backgroundColor,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomLeftRadius,
        borderBottomRightRadius,
        boxShadow,
        color,
        display,
        opacity,
    } = element.getComputedStyle()

    warning(
        display !== "inline",
        "Magic components can't be display: inline, as inline elements don't accept a transform. Try inline-block instead."
    )

    const borderRadiusMatrix = [
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomLeftRadius,
        borderBottomRightRadius,
    ].map(item => (item ? parseFloat(item) : 0))

    return {
        layout: {
            x: { min: left, max: right },
            y: { min: top, max: bottom },
        },
        style: {
            backgroundColor,
            borderTopLeftRadius: borderRadiusMatrix[0],
            borderTopRightRadius: borderRadiusMatrix[1],
            borderBottomLeftRadius: borderRadiusMatrix[2],
            borderBottomRightRadius: borderRadiusMatrix[3],
            boxShadow,
            color: color || "",
            opacity: opacity !== null ? parseFloat(opacity) : 0,
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

export function calcTreeScale(deltas: BoxDelta[]): { x: number; y: number } {
    const numDeltas = deltas.length
    const scale = { x: 1, y: 1 }
    for (let i = 0; i < numDeltas; i++) {
        const delta = deltas[i]
        scale.x *= delta.x.scale
        scale.y *= delta.y.scale
    }

    return scale
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

    // TODO: Check this out
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

export const animatableStyles = [
    "opacity",
    "backgroundColor",
    "border",
    "color",
]
export const numAnimatableStyles = animatableStyles.length

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
const resettable = {
    //background: false,
    backgroundColor: false,
    //borderColor: false,
    border: false,
    borderRadius: false,
    borderTopLeftRadius: "borderTop",
    borderTopRightRadius: "borderTop",
    borderBottomLeftRadius: "borderTop",
    borderBottomRightRadius: "borderTop",
    boxShadow: false,
    color: false,
    opacity: false,
    // width: false,
    // height: false,
    // position: false,
    // opacity: false,
}

export function resetStyles(style: MotionStyle): MotionStyle {
    const reset: MotionStyle = {
        x: 0,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
    }

    // TODO: We need to account for motionvalues
    for (const key in resettable) {
        if (style[key] !== undefined) {
            reset[key] = style[key]
        } else if (resettable[key] && style[resettable[key]]) {
            reset[key] = style[resettable[key]]
        } else {
            //TODO neaten up fallback situations
            if (key === "backgroundColor") {
                if (style.background !== undefined) {
                    // TODO: Might be robust to try and extract a color from this
                    reset[key] = style.background as string
                } else {
                    reset[key] = ""
                }
            } else if (key.endsWith("Radius")) {
                if (style.borderRadius !== undefined) {
                    reset[key] = style.borderRadius
                } else {
                    reset[key] = ""
                }
            } else {
                reset[key] = ""
            }
        }
    }

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

export const batchUpdate = (): MagicBatchTree => {
    const queue = new Set<Magic>()

    const add = (child: Magic) => queue.add(child)

    const flush = (stack?: StackQuery, options: MagicAnimationOptions = {}) => {
        if (!queue.size) return

        const order = Array.from(queue).sort(sortByDepth)

        order.forEach(child => child.resetStyles())

        order.forEach(child => {
            if (!child.isHidden || (stack && stack.isPrevious(child))) {
                child.snapshotTarget()
            }
        })

        order.forEach(child => {
            // Perform a magic animtion as normal if the child isn't hidden
            // and we're not handling magicId stacks in a special way
            if (!child.isHidden && !stack) {
                child.startAnimation(options)
            } else if (stack) {
                if (options.crossfade) {
                    crossfadeComponents(child, stack, options)
                } else {
                    switchComponents(child, stack, options)
                }
            }
        })

        queue.clear()
    }

    return { add, flush }
}

function crossfadeComponents(
    child: Magic,
    stack: StackQuery,
    options: MagicAnimationOptions
) {
    // TODO: Crossfade only needs to happen to the root component in any given stack

    if (child.isHidden && stack.isPrevious(child)) {
        if (!stack.isVisibleExiting(child)) {
            // If this is the previous component that we're animating from,
            // animate it to tthe visible component's position and fade out
            const target = opacity(stack.getVisibleTarget(child), 0)
            child.startAnimation({ ...options, target })
        } else {
            // If this is the previous component that we're animating to,
            // animate it from the visible component's position and fade in
            const origin = opacity(stack.getVisibleOrigin(child), 0.5)
            const target = opacity(child.measuredTarget, 1)
            child.startAnimation({ ...options, origin, target })
        }
    } else if (stack.isVisible(child)) {
        if (!stack.isVisibleExiting(child)) {
            // If this is the visible component that we're animating to,
            // animate it from the previous component's position and fade in
            const origin = opacity(stack.getPreviousOrigin(child), 0)
            child.startAnimation({ ...options, origin })
        } else {
            // If this is the visible component that we're animating from,
            // animate it to the previous component's position and fade out
            const target = opacity(stack.getPreviousOrigin(child), 0)
            child.startAnimation({ ...options, target })
        }
    } else if (!child.isHidden) {
        child.startAnimation()
    }
}

function switchComponents(
    child: Magic,
    stack: StackQuery,
    options: MagicAnimationOptions
) {
    // If this is the top component in the stack, animate it to the previous origin
    if (stack.isVisible(child)) {
        child.startAnimation({
            ...options,
            target: opacity(stack.getPreviousOrigin(child), 1),
        })
    } else if (!child.isHidden) {
        child.startAnimation()
    }
}

function opacity(snapshot?: Snapshot, value: number = 1) {
    if (!snapshot) return
    return {
        ...snapshot,
        style: {
            ...snapshot.style,
            opacity: value,
        },
    }
}

const sortByDepth = (a: Magic, b: Magic) => a.depth - b.depth

export function near(value: number, target = 0, maxDistance = 0.01): boolean {
    return distance(value, target) < maxDistance
}

// Replace with code from Stylefire
const CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g
const REPLACE_TEMPLATE = "$1-$2"
export const camelToDash = (str: string) =>
    str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase()
