import { RefObject, useMemo, useRef, useEffect } from "react"
import { usePanGesture, PanInfo } from "../gestures"
import { Lock, getGlobalLock } from "./utils/lock"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { Point, usePointerEvents } from "../events"
import { MotionValue } from "../value"
import { mix } from "@popmotion/popcorn"
import { ValueAnimationControls } from "../animation/ValueAnimationControls"
import { Omit, Inertia } from "../types"
import {
    blockViewportScroll,
    unblockViewportScroll,
} from "./utils/block-viewport-scroll"
import { invariant } from "hey-listen"
import { useResize } from "../utils/use-resize"
import { isRefObject } from "../utils/is-ref-object"

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
     * beyond which dragging is constrained.
     *
     * ```jsx
     * <motion.div
     *   drag="x"
     *   dragConstraints={{ left: 0, right: 300 }}
     * />
     * ```
     *
     * Another component can be used as drag constraints by creating a `ref` with React's `useRef`.hook.
     * This `ref` should be passed to that component's `ref` prop and to this component's `dragConstraints` prop.
     */
    dragConstraints?:
        | false
        | { top?: number; right?: number; bottom?: number; left?: number }
        | RefObject<Element>

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

const getBoundingBox = (ref: RefObject<Element>) => {
    return (ref.current as Element).getBoundingClientRect()
}

const getCurrentOffset = (point?: MotionValue<number>) =>
    point ? point.get() : 0

/**
 * Takes a parent Element and a draggable Element and returns pixel-based drag constraints.
 *
 * @param constraintsRef
 * @param draggableRef
 */
const calculateConstraintsFromDom = (
    constraintsRef: RefObject<Element>,
    draggableRef: RefObject<Element>,
    point: MotionPoint
) => {
    invariant(
        constraintsRef.current !== null && draggableRef.current !== null,
        "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop."
    )

    const parentBoundingBox = getBoundingBox(constraintsRef)
    const draggableBoundingBox = getBoundingBox(draggableRef)

    const top =
        parentBoundingBox.top -
        draggableBoundingBox.top +
        getCurrentOffset(point.y)
    const left =
        parentBoundingBox.left -
        draggableBoundingBox.left +
        getCurrentOffset(point.x)

    const constraints = {
        top,
        left,
        right: parentBoundingBox.width - draggableBoundingBox.width + left,
        bottom: parentBoundingBox.height - draggableBoundingBox.height + top,
    }

    return constraints
}

const flattenConstraints = (constraints: DraggableProps["dragConstraints"]) => {
    if (!constraints) {
        return [0, 0, 0, 0]
    } else if (isRefObject(constraints)) {
        return [constraints.current]
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
    const dragFactor = typeof dragElastic === "number" ? dragElastic : 0.35
    return mix(origin, current, dragFactor)
}

type MotionPoint = Partial<{
    x: MotionValue<number>
    y: MotionValue<number>
}>

const bothAxis = <T>(handler: (axis: "x" | "y") => T): T[] => [
    handler("x"),
    handler("y"),
]

/**
 * A hook that allows an element to be dragged.
 *
 * @internalremarks
 *
 * TODO:
 *  - When drag momentum animations are running and a `ref` constraints is resized,
 *    everything breaks.
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
        ...handlers
    }: DraggableProps,
    ref: RefObject<Element | null>,
    values: MotionValuesMap,
    controls: ValueAnimationControls
) {
    const point = useRef<MotionPoint>({}).current
    const origin = useRef({ x: 0, y: 0 }).current

    // By keeping a reference to the user-defined drag handlers and referring
    // to that from within our `useMemo`-generated pan handlers, we can ensure
    // we're always referring to the latest ones *without* having to reinitialise
    // the handlers. These are almost guaranteed to be different every render
    // but don't necessitate creating new handlers.
    const dragHandlers = useRef<DragHandlers>(handlers)
    dragHandlers.current = handlers

    // If `dragConstraints` is a React `ref`, we should resolve the constraints once the
    // component has rendered.
    const constraintsNeedResolution = isRefObject(dragConstraints)

    // If `dragConstraints` is a React `ref`, we need to track changes in its
    // size and update the current draggable position relative to that.
    const prevConstraintsBox = useRef({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    }).current

    const scalePoint = () => {
        if (!isRefObject(dragConstraints)) return

        const constraintsBox = getBoundingBox(dragConstraints)
        const draggableBox = getBoundingBox(ref)

        // Scale a point relative to the transformation of a constraints-providing element.
        const scaleAxisPoint = (
            axis: "x" | "y",
            dimension: "width" | "height"
        ) => {
            const pointToScale = point[axis]
            if (!pointToScale) return

            // Stop any current animations as they bug out if you resize during one
            if (pointToScale.isAnimating()) {
                pointToScale.stop()
                recordBoxInfo()
                return
            }

            // If the previous dimension was `0` (default), set `scale` to `1` to prevent
            // divide by zero errors.
            const scale = prevConstraintsBox[dimension]
                ? (constraintsBox[dimension] - draggableBox[dimension]) /
                  prevConstraintsBox[dimension]
                : 1

            pointToScale.set(prevConstraintsBox[axis] * scale)
        }

        scaleAxisPoint("x", "width")
        scaleAxisPoint("y", "height")
    }

    useResize(dragConstraints, scalePoint)

    // If our drag constraints are a potentially live bounding box, record its previously-calculated
    // dimensions and the current x/y
    const recordBoxInfo = (constraints?: Constraints | false) => {
        if (constraints) {
            const { right, left, bottom, top } = constraints
            prevConstraintsBox.width = (right || 0) - (left || 0)
            prevConstraintsBox.height = (bottom || 0) - (top || 0)
        }

        if (point.x) prevConstraintsBox.x = point.x.get()
        if (point.y) prevConstraintsBox.y = point.y.get()
    }

    const applyConstraintsToPoint = (constraints: Constraints) => {
        return bothAxis(axis => {
            const axisPoint = point[axis]
            axisPoint && applyConstraints(axis, axisPoint, constraints, 0)
        })
    }

    // On mount, if our bounding box is a ref, we need to resolve the constraints
    // and immediately apply them to our point.
    useEffect(() => {
        if (!constraintsNeedResolution) return
        const constraints = calculateConstraintsFromDom(
            dragConstraints as RefObject<Element>,
            ref,
            point
        )

        applyConstraintsToPoint(constraints)
        recordBoxInfo(constraints)
    })

    // Create our handlers for the `pan` gesture.
    const panHandlers = useMemo(
        () => {
            if (!drag) return {}

            // We'll use this to determine whether to fire the `onDragEnd` callback.
            let hasDragged = false

            // Don't start dragging until we've detected a direction.
            let currentDirection: null | DragDirection = null

            // This is a reference to the global drag gesture lock, ensuring only one component
            // can "capture" the drag of one or both axes. In some odd circumstances, a re-render
            // has caused reference to this lock to be lost, if we see this appear again it might
            // be safer to move this to a hook-root `ref`.
            let openGlobalLock: null | Lock = null

            // If `dragConstraints` is set to `false` or `Constraints`, set constraints immediately.
            // Otherwise we'll resolve on mount.
            let resolvedDragConstraints:
                | Constraints
                | false = constraintsNeedResolution
                ? false
                : (dragConstraints as Constraints | false)

            // Get the `MotionValue` for both draggable axes, or create them if they don't already
            // exist on this component.
            bothAxis(axis => {
                if (!shouldDrag(axis, drag, currentDirection)) return
                const axisValue = values.get(axis, 0)
                point[axis] = axisValue
            })

            // Apply constraints immediately, even before render, if our constraints are a plain object.
            if (resolvedDragConstraints && !constraintsNeedResolution) {
                applyConstraintsToPoint(resolvedDragConstraints)
            }

            // Add additional information to the `PanInfo` object before passing it to drag listeners.
            const convertPanToDrag = (info: PanInfo) => ({
                ...info,
                point: {
                    x: point.x ? point.x.get() : 0,
                    y: point.y ? point.y.get() : 0,
                },
            })

            // This function will be used to update each axis point every frame.
            const updatePoint = (
                axis: "x" | "y",
                offset: { x: number; y: number }
            ) => {
                const axisPoint = point[axis]

                // If we're not dragging this axis, do an early return.
                if (!shouldDrag(axis, drag, currentDirection) || !axisPoint) {
                    return
                }

                hasDragged = true
                let current = origin[axis] + offset[axis]

                current = applyConstraints(
                    axis,
                    current,
                    resolvedDragConstraints,
                    dragElastic
                )

                axisPoint.set(current)
            }

            const onPointerDown = () => {
                // Initiate viewport scroll blocking on touch start. This is a very aggressive approach
                // which has come out of the difficulty in us being able to do this once a scroll gesture
                // has initiated in mobile browsers. This means if there's a horizontally-scrolling carousel
                // on a page we can let a user scroll the page itself from it. Ideally what we'd do is
                // trigger this once we've got a scroll direction determined. This approach sort-of worked
                // but if the component was dragged quite far in a single frame page scrolling would initiate.
                // Maybe if we turn the direction lock threshold down.
                blockViewportScroll()

                // Stop any animations on both axis values immediately. This allows the user to throw and catch
                // the component.
                bothAxis(axis => {
                    const axisPoint = point[axis]
                    axisPoint && axisPoint.stop()
                })
            }

            const onPanStart = (
                event: MouseEvent | TouchEvent,
                info: PanInfo
            ) => {
                hasDragged = false

                // Resolve the constraints again in case anything has changed in the meantime.
                if (constraintsNeedResolution) {
                    resolvedDragConstraints = calculateConstraintsFromDom(
                        dragConstraints as RefObject<Element>,
                        ref,
                        point
                    )

                    applyConstraintsToPoint(resolvedDragConstraints)
                }

                // Set point origin and stop any existing animations.
                bothAxis(axis => {
                    const axisPoint = point[axis]
                    if (!axisPoint) return

                    origin[axis] = axisPoint.get()
                    axisPoint.stop()
                })

                // Attempt to grab the global drag gesture lock.
                if (!dragPropagation) {
                    openGlobalLock = getGlobalLock(drag)

                    if (!openGlobalLock) {
                        return
                    }
                }

                currentDirection = null

                // Alert listeners that dragging has started.
                const { onDragStart } = dragHandlers.current
                onDragStart && onDragStart(event, convertPanToDrag(info))
            }

            const onPan = (event: MouseEvent | TouchEvent, info: PanInfo) => {
                // If we didn't successfully receive the gesture lock, early return.
                if (!dragPropagation && !openGlobalLock) {
                    return
                }

                const { offset } = info

                // Attempt to detect drag direction if directionLock is true
                if (dragDirectionLock && currentDirection === null) {
                    currentDirection = getCurrentDirection(offset)

                    // If we've successfully set a direction, notify listener
                    if (currentDirection !== null) {
                        const { onDirectionLock } = dragHandlers.current
                        onDirectionLock && onDirectionLock(currentDirection)
                    }

                    return
                }

                updatePoint("x", offset)
                updatePoint("y", offset)

                const { onDrag } = dragHandlers.current
                onDrag && onDrag(event, convertPanToDrag(info))
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

                if (!hasDragged) return

                // If we have `dragMomentum` defined, initiate momentum animations for both axis.
                if (dragMomentum) {
                    const momentumAnimations = bothAxis(axis => {
                        if (!shouldDrag(axis, drag, currentDirection)) {
                            return
                        }

                        const transition = resolvedDragConstraints
                            ? getConstraints(axis, resolvedDragConstraints)
                            : {}

                        return controls.start({
                            [axis]: 0,
                            // TODO: It might be possible to allow `type` animations to be set as
                            // Popmotion animations as well as strings. Then people could define their own
                            // and it'd open another route for us to code-split.
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
                    })

                    // Run all animations and then resolve the new drag constraints.
                    Promise.all(momentumAnimations).then(() => {
                        recordBoxInfo(resolvedDragConstraints)
                        scalePoint()
                        const { onDragTransitionEnd } = dragHandlers.current
                        onDragTransitionEnd && onDragTransitionEnd()
                    })
                } else {
                    recordBoxInfo(resolvedDragConstraints)
                }

                const { onDragEnd } = dragHandlers.current
                onDragEnd && onDragEnd(event, convertPanToDrag(info))
            }

            return {
                onPanStart,
                onPan,
                onPanEnd,
                onPointerDown,
            }
        },
        [
            drag,
            dragDirectionLock,
            dragPropagation,
            dragElastic,
            dragMomentum,
            ...flattenConstraints(dragConstraints),
            dragTransition,
        ]
    )

    usePanGesture(panHandlers, ref)
    usePointerEvents({ onPointerDown: panHandlers.onPointerDown }, ref)
}

/**
 * Based on an x/y offset determine the current drag direction. If both axis' offsets are lower
 * than the provided threshold, return `null`.
 *
 * @param offset - The x/y offset from origin.
 * @param lockThreshold - (Optional) - the minimum absolute offset before we can determine a drag direction.
 */
function getCurrentDirection(
    offset: Point,
    lockThreshold = 10
): DragDirection | null {
    let direction: DragDirection | null = null

    if (Math.abs(offset.y) > lockThreshold) {
        direction = "y"
    } else if (Math.abs(offset.x) > lockThreshold) {
        direction = "x"
    }

    return direction
}
