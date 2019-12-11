import { RefObject, useRef, useEffect, useContext } from "react"
import { usePanGesture, PanInfo } from "../gestures"
import { Lock, getGlobalLock } from "./utils/lock"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { Point } from "../events/types"
import { MotionValue } from "../value"
import { mix } from "@popmotion/popcorn"
import { ValueAnimationControls } from "../animation/ValueAnimationControls"
import {
    blockViewportScroll,
    unblockViewportScroll,
} from "./utils/block-viewport-scroll"
import { invariant } from "hey-listen"
import { useResize } from "../utils/use-resize"
import { isRefObject } from "../utils/is-ref-object"
import {
    MotionPluginContext,
    MotionPlugins,
} from "../motion/context/MotionPluginContext"
import { useMotionValue } from "../value/use-motion-value"
import { DraggableProps, DragHandlers } from "./types"
import { useLatest } from "../utils/use-latest"
import { useUnmountEffect } from "../utils/use-unmount-effect"
import { supportsTouchEvents } from "../events/utils"

type DragDirection = "x" | "y"

export type Constraints = {
    left?: number
    right?: number
    top?: number
    bottom?: number
}

/**
 * Don't block the default pointerdown behaviour of these elements.
 */
const allowDefaultPointerDown = new Set(["INPUT", "TEXTAREA", "SELECT"])

const getBoundingBox = (
    ref: RefObject<Element>,
    transformPagePoint: MotionPlugins["transformPagePoint"]
) => {
    const rect = (ref.current as Element).getBoundingClientRect()

    const { x: left, y: top } = transformPagePoint({
        x: rect.left,
        y: rect.top,
    })
    const { x: width, y: height } = transformPagePoint({
        x: rect.width,
        y: rect.height,
    })
    return { left, top, width, height }
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
    point: MotionPoint,
    transformPagePoint: MotionPlugins["transformPagePoint"]
) => {
    invariant(
        constraintsRef.current !== null && draggableRef.current !== null,
        "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop."
    )

    const parentBoundingBox = getBoundingBox(constraintsRef, transformPagePoint)
    const draggableBoundingBox = getBoundingBox(
        draggableRef,
        transformPagePoint
    )

    const left =
        parentBoundingBox.left -
        draggableBoundingBox.left +
        getCurrentOffset(point.x)

    const top =
        parentBoundingBox.top -
        draggableBoundingBox.top +
        getCurrentOffset(point.y)

    const right = parentBoundingBox.width - draggableBoundingBox.width + left
    const bottom = parentBoundingBox.height - draggableBoundingBox.height + top

    return { top, left, right, bottom }
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

function applyOverdrag(
    origin: number,
    current: number,
    dragElastic: boolean | number
) {
    const dragFactor = typeof dragElastic === "number" ? dragElastic : 0.35
    return mix(origin, current, dragFactor)
}

function bothAxis<T>(handler: (axis: "x" | "y") => T): T[] {
    return [handler("x"), handler("y")]
}

type MotionPoint = Partial<{
    x: MotionValue<number>
    y: MotionValue<number>
}>

interface DragStatus {
    isDragging: boolean
    currentDirection: DragDirection | null
    constraints: Constraints | false
}

/**
 * A hook that allows an element to be dragged.
 *
 * @param param
 * @param ref
 * @param values
 * @param controls
 *
 * @internal
 */
export function useDrag(
    {
        drag = false,
        dragDirectionLock = false,
        dragPropagation = false,
        dragConstraints = false,
        dragElastic = true,
        dragMomentum = true,
        _dragValueX,
        _dragValueY,
        _dragTransitionControls,
        dragOriginX,
        dragOriginY,
        dragTransition,
        onDirectionLock,
        onDragStart,
        onDrag,
        onDragEnd,
        onDragTransitionEnd,
    }: DraggableProps,
    ref: RefObject<Element>,
    values: MotionValuesMap,
    controls: ValueAnimationControls
) {
    // If `dragConstraints` is a React `ref`, we should resolve the constraints once the
    // component has rendered.
    const constraintsNeedResolution = isRefObject(dragConstraints)

    // We create a mutable state using a ref as we want to keep track of certain data, even across renders,
    // but we don't want to re-render as a result of them.
    const dragStatus = useRef<DragStatus>({
        isDragging: false,
        currentDirection: null,
        constraints: false,
    }).current

    // Load the callbacks into mutable state to ensure that even if we don't create a new
    // gesture handler every render, we still reference the latest callbacks (which are almost certain to change per render)
    const handlersRef = useLatest<DragHandlers>({
        onDragStart,
        onDrag,
        onDragEnd,
        onDirectionLock,
        onDragTransitionEnd,
    })

    const point = useRef<MotionPoint>({}).current

    // Track origin
    const defaultOriginX = useMotionValue(0)
    const defaultOriginY = useMotionValue(0)
    const origin = {
        x: dragOriginX || defaultOriginX,
        y: dragOriginY || defaultOriginY,
    }

    // This is a reference to the global drag gesture lock, ensuring only one component
    // can "capture" the drag of one or both axes.
    const openGlobalLock = useRef<Lock | null>(null)

    const { transformPagePoint } = useContext(MotionPluginContext)

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

        const constraintsBox = getBoundingBox(
            dragConstraints,
            transformPagePoint
        )
        const draggableBox = getBoundingBox(ref, transformPagePoint)

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

            axisPoint &&
                !axisPoint.isAnimating() &&
                applyConstraints(axis, axisPoint, constraints, 0)
        })
    }

    // On mount, if our bounding box is a ref, we need to resolve the constraints
    // and immediately apply them to our point.
    useEffect(() => {
        if (constraintsNeedResolution) {
            const constraints = calculateConstraintsFromDom(
                dragConstraints as RefObject<Element>,
                ref,
                point,
                transformPagePoint
            )

            applyConstraintsToPoint(constraints)
            recordBoxInfo(constraints)
        } else if (!dragStatus.isDragging && dragStatus.constraints) {
            applyConstraintsToPoint(dragStatus.constraints)
        }
    }, [])

    // If `dragConstraints` is set to `false` or `Constraints`, set constraints immediately.
    // Otherwise we'll resolve on mount.
    dragStatus.constraints = constraintsNeedResolution
        ? dragStatus.constraints || false
        : (dragConstraints as Constraints | false)

    // Get the `MotionValue` for both draggable axes, or create them if they don't already
    // exist on this component.
    bothAxis(axis => {
        if (!shouldDrag(axis, drag, dragStatus.currentDirection)) return
        const defaultValue = axis === "x" ? _dragValueX : _dragValueY
        point[axis] = defaultValue || values.get(axis, 0)
    })

    // Add additional information to the `PanInfo` object before passing it to drag listeners.
    function convertPanToDrag(info: PanInfo) {
        return {
            ...info,
            point: {
                x: point.x ? point.x.get() : 0,
                y: point.y ? point.y.get() : 0,
            },
        }
    }

    // This function will be used to update each axis point every frame.
    function updatePoint(axis: "x" | "y", offset: { x: number; y: number }) {
        const axisPoint = point[axis]

        // If we're not dragging this axis, do an early return.
        if (
            !shouldDrag(axis, drag, dragStatus.currentDirection) ||
            !axisPoint
        ) {
            return
        }

        const current = applyConstraints(
            axis,
            origin[axis].get() + offset[axis],
            dragStatus.constraints,
            dragElastic
        )

        axisPoint.set(current)
    }

    function onPanSessionStart(event: MouseEvent | TouchEvent | PointerEvent) {
        if (
            event.target &&
            !allowDefaultPointerDown.has((event.target as Element).tagName)
        ) {
            // On iOS it's important to not `preventDefault` the `touchstart`
            // event, as otherwise clicks won't fire inside the draggable element.
            if (!supportsTouchEvents()) {
                // Prevent browser-specific behaviours like text selection or Chrome's image dragging.
                event.preventDefault()

                // Make sure input elements loose focus when we prevent the default.
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur()
                }
            }
        }

        // Initiate viewport scroll blocking on touch start. This is a very aggressive approach
        // which has come out of the difficulty in us being able to do this once a scroll gesture
        // has initiated in mobile browsers. This means if there's a horizontally-scrolling carousel
        // on a page we can't let a user scroll the page itself from it. Ideally what we'd do is
        // trigger this once we've got a scroll direction determined. This approach sort-of worked
        // but if the component was dragged too far in a single frame page scrolling would initiate.
        blockViewportScroll()

        // Stop any animations on both axis values immediately. This allows the user to throw and catch
        // the component.
        bothAxis(axis => {
            const axisPoint = point[axis]
            axisPoint && axisPoint.stop()
        })
    }

    function onPanStart(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) {
        // Resolve the constraints again in case anything has changed in the meantime.
        if (constraintsNeedResolution) {
            dragStatus.constraints = calculateConstraintsFromDom(
                dragConstraints as RefObject<Element>,
                ref,
                point,
                transformPagePoint
            )

            applyConstraintsToPoint(dragStatus.constraints)
        }

        // Set point origin and stop any existing animations.
        bothAxis(axis => {
            const axisPoint = point[axis]
            if (!axisPoint) return

            origin[axis].set(axisPoint.get())
            axisPoint.stop()
        })

        // Attempt to grab the global drag gesture lock.
        if (!dragPropagation) {
            if (openGlobalLock.current) openGlobalLock.current()
            openGlobalLock.current = getGlobalLock(drag)

            if (!openGlobalLock.current) {
                return
            }
        }

        dragStatus.isDragging = true
        dragStatus.currentDirection = null

        const { onDragStart } = handlersRef.current
        onDragStart && onDragStart(event, convertPanToDrag(info))
    }

    function onPan(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) {
        // If we didn't successfully receive the gesture lock, early return.
        if (!dragPropagation && !openGlobalLock.current) {
            return
        }

        const { offset } = info

        // Attempt to detect drag direction if directionLock is true
        if (dragDirectionLock && dragStatus.currentDirection === null) {
            dragStatus.currentDirection = getCurrentDirection(offset)

            // If we've successfully set a direction, notify listener
            if (dragStatus.currentDirection !== null) {
                const { onDirectionLock } = handlersRef.current
                onDirectionLock && onDirectionLock(dragStatus.currentDirection)
            }

            return
        }

        updatePoint("x", offset)
        updatePoint("y", offset)

        const { onDrag } = handlersRef.current
        onDrag && onDrag(event, convertPanToDrag(info))
    }

    function cancelDrag() {
        unblockViewportScroll()
        dragStatus.isDragging = false

        if (!dragPropagation && openGlobalLock.current) {
            openGlobalLock.current()
            openGlobalLock.current = null
        }
    }

    function animateDragEnd(velocity: Point) {
        const momentumAnimations = bothAxis(axis => {
            if (!shouldDrag(axis, drag, dragStatus.currentDirection)) {
                return
            }

            const transition = dragStatus.constraints
                ? getConstraints(axis, dragStatus.constraints)
                : {}

            /**
             * Overdamp the boundary spring if `dragElastic` is disabled. There's still a frame
             * of spring animations so we should look into adding a disable spring option to `inertia`.
             * We could do something here where we affect the `bounceStiffness` and `bounceDamping`
             * using the value of `dragElastic`.
             */
            const bounceStiffness = dragElastic ? 200 : 1000000
            const bounceDamping = dragElastic ? 40 : 10000000

            const animationControls = _dragTransitionControls || controls
            return animationControls.start({
                [axis]: 0,
                // TODO: It might be possible to allow `type` animations to be set as
                // Popmotion animations as well as strings. Then people could define their own
                // and it'd open another route for us to code-split.
                transition: {
                    type: "inertia",
                    velocity: dragMomentum ? velocity[axis] : 0,
                    bounceStiffness,
                    bounceDamping,
                    timeConstant: 750,
                    restDelta: 1,
                    ...dragTransition,
                    ...transition,
                },
            })
        })

        // Run all animations and then resolve the new drag constraints.
        Promise.all(momentumAnimations).then(() => {
            recordBoxInfo(dragStatus.constraints)
            scalePoint()
            const { onDragTransitionEnd } = handlersRef.current
            onDragTransitionEnd && onDragTransitionEnd()
        })
    }

    function onPanEnd(
        event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) {
        const isDragging = dragStatus.isDragging
        cancelDrag()
        if (!isDragging) return

        // If we have either `dragMomentum` or `dragElastic`, initiate momentum and boundary spring animation for both axes.
        if (dragMomentum || dragElastic) {
            const { velocity } = info
            animateDragEnd(velocity)
        } else {
            recordBoxInfo(dragStatus.constraints)
        }

        const { onDragEnd } = handlersRef.current
        onDragEnd && onDragEnd(event, convertPanToDrag(info))
    }

    usePanGesture(
        drag ? { onPan, onPanStart, onPanEnd, onPanSessionStart } : {},
        ref
    )
    useUnmountEffect(() => dragStatus.isDragging && cancelDrag())
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
