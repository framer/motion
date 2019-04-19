import { RefObject, useMemo, useRef } from "react"
import { usePanGesture, PanInfo } from "../gestures"
import { Lock, getGlobalLock } from "./utils/lock"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { Point, usePointerEvents } from "../events"
import { MotionValue } from "../value"
import { mix } from "@popmotion/popcorn"
import { ComponentAnimationControls } from "../motion"
import { Omit, Inertia } from "../types"
import {
    blockViewportScroll,
    unblockViewportScroll,
} from "./utils/block-viewport-scroll"

type DragDirection = "x" | "y"

export type Constraints = {
    left?: number
    right?: number
    top?: number
    bottom?: number
}

/** @public */
export interface DragHandlers {
    /**
     * Callback function that fires when dragging starts.
     *
     * ```jsx
     * function onDragStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     *  <motion.div drag onDragStart={onDragStart} />
     * ```
     */
    onDragStart?(event: MouseEvent | TouchEvent, info: PanInfo): void

    /**
     * Callback function that fires when dragging ends.
     *
     * ```jsx
     * function onDragEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div drag onDragEnd={onDragEnd} />
     * ```
     */
    onDragEnd?(event: MouseEvent | TouchEvent, info: PanInfo): void

    /**
     * Callback function that fires when the component is dragged.
     *
     * ```jsx
     * function onDrag (event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <motion.div drag onDrag={onDrag} />
     * ```
     */
    onDrag?(event: MouseEvent | TouchEvent, info: PanInfo): void

    /**
     * Callback function that fires a drag direction is determined.
     *
     * ```jsx
     * function onDirectionLock(axis) {
     *   console.log(axis)
     * }
     *
     * <motion.div drag="lockDirection" onDirectionLock={onDirectionLock} />
     * ```
     */
    onDirectionLock?(axis: "x" | "y"): void

    /**
     * Callback function that fires when drag momentum/bounce transition finishes.
     *
     * ```jsx
     * function onDragTransitionEnd() {
     *   console.log('drag transition has ended')
     * }
     *
     * <motion.div drag onDragTransitionEnd={onDragTransitionEnd} />
     * ```
     */
    onDragTransitionEnd?(): void
}

/**
 * @public
 */
export type InertiaOptions = Partial<Omit<Inertia, "velocity" | "type">>

/**
 * @public
 */
export interface DraggableProps extends DragHandlers {
    /**
     * Enable dragging for this element. Set to `false` by default.
     * Set `true` to drag in both directions.
     * Set `"x"` or `"y"` to only drag in a specific direction.
     *
     * ```jsx
     * <motion.div drag="x" />
     * ```
     */
    drag?: boolean | "x" | "y"

    /**
     * If `true`, this will lock dragging to the initially-detected direction. Defaults to `false`.
     *
     * ```jsx
     * <motion.div drag dragDirectionLock />
     * ```
     */
    dragDirectionLock?: boolean

    /**
     * Allows drag gesture propagation to child components. Set to `false` by
     * default.
     *
     * ```jsx
     * <motion.div drag="x" dragPropagation />
     * ```
     */
    dragPropagation?: boolean

    /**
     * An object of optional `top`, `left`, `right`, `bottom` pixel values,
     * beyond which dragging is constrained
     *
     * ```jsx
     * <motion.div
     *   drag="x"
     *   dragConstraints={{ left: 0, right: 300 }}
     * />
     * ```
     */
    dragConstraints?:
        | false
        | { top?: number; right?: number; bottom?: number; left?: number }

    /**
     * The degree of movement allowed outside constraints. 0 = no movement, 1 =
     * full movement. Set to `0.5` by default.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragElastic={0.2}
     * />
     * ```
     */
    dragElastic?: boolean | number

    /**
     * Apply momentum from the pan gesture to the component when dragging
     * finishes. Set to `true` by default.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragMomentum={false}
     * />
     * ```
     */
    dragMomentum?: boolean

    /**
     * Allows you to change dragging inertia parameters.
     * When releasing a draggable Frame, an animation with type `inertia` starts. The animation is based on your dragging velocity. This property allows you to customize it.
     * See {@link https://framer.com/api/animation/#inertia | Inertia} for all properties you can use.
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
     * />
     * ```
     */
    dragTransition?: InertiaOptions
}

const flattenConstraints = (constraints: Constraints | false) => {
    if (!constraints) {
        return [0, 0, 0, 0]
    } else {
        const { top, left, bottom, right } = constraints
        return [top, left, bottom, right]
    }
}

function shouldDrag(
    direction: DragDirection,
    drag: boolean | DragDirection,
    currentDirection: null | DragDirection
) {
    return (
        (drag === true || drag === direction) &&
        (currentDirection === null || currentDirection === direction)
    )
}

const getConstraints = (
    axis: "x" | "y",
    { top, right, bottom, left }: Constraints
) => {
    if (axis === "x") {
        return { min: left, max: right }
    } else {
        return { min: top, max: bottom }
    }
}

function applyConstraints(
    axis: "x" | "y",
    value: number | MotionValue<number>,
    constraints: Constraints | false,
    dragElastic: boolean | number
): number {
    let constrainedValue = value instanceof MotionValue ? value.get() : value
    if (!constraints) {
        return constrainedValue
    }
    const { min, max } = getConstraints(axis, constraints)

    if (min !== undefined && constrainedValue < min) {
        constrainedValue = dragElastic
            ? applyOverdrag(min, constrainedValue, dragElastic)
            : Math.max(min, constrainedValue)
    } else if (max !== undefined && constrainedValue > max) {
        constrainedValue = dragElastic
            ? applyOverdrag(max, constrainedValue, dragElastic)
            : Math.min(max, constrainedValue)
    }
    if (value instanceof MotionValue) {
        value.set(constrainedValue)
    }
    return constrainedValue
}

const applyOverdrag = (
    origin: number,
    current: number,
    dragElastic: boolean | number
) => {
    const dragFactor = typeof dragElastic === "number" ? dragElastic : 0.5
    return mix(origin, current, dragFactor)
}

type MotionPoint = Partial<{
    x: MotionValue<number>
    y: MotionValue<number>
}>

/**
 * A hook that allows an element to be dragged.
 *
 * @internalremarks
 * TODO:
 * 1. Allow `dragMomentum` to accept richer properties that adjust this behaviour
 * 2. Allow a parent motion component to become the drag boundaries for a child
 *
 * @param param
 * @param ref
 * @param values
 * @param controls
 *
 * @internal
 */
export function useDraggable(
    {
        drag = false,
        dragDirectionLock = false,
        dragPropagation = false,
        dragConstraints = false,
        dragElastic = true,
        dragMomentum = true,
        dragTransition,
        onDragStart,
        onDragEnd,
        onDrag,
        onDirectionLock,
        onDragTransitionEnd,
    }: DraggableProps,
    ref: RefObject<Element | null>,
    values: MotionValuesMap,
    controls: ComponentAnimationControls
) {
    const point = useRef<MotionPoint>({}).current
    const onDragRef = useRef<any>(onDrag)
    const origin = useRef({ x: 0, y: 0 }).current
    onDragRef.current = onDrag

    const handlers = useMemo(
        () => {
            if (!drag) return {}

            let currentDirection: null | DragDirection = null
            let openGlobalLock: null | Lock = null

            if (shouldDrag("x", drag, currentDirection)) {
                const x = values.get("x", 0)
                applyConstraints("x", x, dragConstraints, dragElastic)
                point.x = x
            }
            if (shouldDrag("y", drag, currentDirection)) {
                const y = values.get("y", 0)
                applyConstraints("y", y, dragConstraints, dragElastic)
                point.y = y
            }

            const convertPanToDrag = (info: PanInfo) => ({
                ...info,
                point: {
                    x: point.x ? point.x.get() : 0,
                    y: point.y ? point.y.get() : 0,
                },
            })

            const updatePoint = (
                axis: "x" | "y",
                offset: { x: number; y: number }
            ) => {
                const p = point[axis]
                if (!shouldDrag(axis, drag, currentDirection) || !p) {
                    return
                }

                let current = origin[axis] + offset[axis]

                current = applyConstraints(
                    axis,
                    current,
                    dragConstraints,
                    dragElastic
                )

                p.set(current)
            }

            const onPointerDown = () => {
                if (point.x) point.x.stop()
                if (point.y) point.y.stop()
            }

            const onPanStart = (
                event: MouseEvent | TouchEvent,
                info: PanInfo
            ) => {
                const handle = (axis: "x" | "y") => {
                    const axisPoint = point[axis]
                    if (!axisPoint) return

                    origin[axis] = axisPoint.get()
                    axisPoint.stop()
                }

                handle("x")
                handle("y")

                if (!dragPropagation) {
                    openGlobalLock = getGlobalLock(drag)

                    if (!openGlobalLock) {
                        return
                    }
                }
                currentDirection = null

                onDragStart && onDragStart(event, convertPanToDrag(info))
            }

            const onPan = (event: MouseEvent | TouchEvent, info: PanInfo) => {
                if (!dragPropagation && !openGlobalLock) {
                    return
                }

                const { offset } = info

                if (dragDirectionLock && currentDirection === null) {
                    currentDirection = getCurrentDirection(offset)

                    if (currentDirection !== null) {
                        onDirectionLock && onDirectionLock(currentDirection)
                        blockViewportScroll()
                    }
                    return
                }

                blockViewportScroll()
                updatePoint("x", offset)
                updatePoint("y", offset)

                // here we use ref to call only the last event handler
                if (onDragRef.current) {
                    onDragRef.current(event, convertPanToDrag(info))
                }
            }

            const onPanEnd = (
                event: MouseEvent | TouchEvent,
                info: PanInfo
            ) => {
                unblockViewportScroll()
                const { velocity } = info

                if (!dragPropagation && openGlobalLock) {
                    openGlobalLock()
                } else if (!openGlobalLock) {
                    return
                }

                if (dragMomentum) {
                    const startMomentum = (axis: "x" | "y") => {
                        if (!shouldDrag(axis, drag, currentDirection)) {
                            return
                        }

                        const transition = dragConstraints
                            ? getConstraints(axis, dragConstraints)
                            : {}

                        return controls.start({
                            [axis]: 0,
                            transition: {
                                type: "inertia",
                                velocity: velocity[axis],
                                bounceStiffness: 200,
                                bounceDamping: 40,
                                timeConstant: 750,
                                restDelta: 1,
                                ...dragTransition,
                                ...transition,
                            },
                        })
                    }

                    Promise.all([startMomentum("x"), startMomentum("y")]).then(
                        () => {
                            onDragTransitionEnd && onDragTransitionEnd()
                        }
                    )
                }

                onDragEnd && onDragEnd(event, convertPanToDrag(info))
            }

            return {
                onPanStart,
                onPan,
                onPanEnd,
                onPointerDown,
            }
        },

        [drag, ...flattenConstraints(dragConstraints), onDragTransitionEnd]
    )

    usePanGesture(handlers, ref)
    usePointerEvents({ onPointerDown: handlers.onPointerDown }, ref)
}

function getCurrentDirection(offset: Point): DragDirection | null {
    const lockThreshold = 10
    let direction: DragDirection | null = null
    if (Math.abs(offset.y) > lockThreshold) {
        direction = "y"
    } else if (Math.abs(offset.x) > lockThreshold) {
        direction = "x"
    }
    return direction
}
