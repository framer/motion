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
import { DragControls } from "./DragControls"
import { useConstant } from "utils/use-constant"
import { usePointerEvent } from "events/use-pointer-event"

type DragDirection = "x" | "y"

export type Constraints = {
    left?: number
    right?: number
    top?: number
    bottom?: number
}

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
    props: DraggableProps,
    ref: RefObject<Element>,
    values: MotionValuesMap,
    controls: ValueAnimationControls
) {
    const { dragControls: groupDragControls } = props
    const { transformPagePoint } = useContext(MotionPluginContext)

    // If `dragConstraints` is a React `ref`, we should resolve the constraints once the
    // component has rendered.
    const constraintsNeedResolution = isRefObject(props.dragConstraints)

    const dragControls = useConstant(() => new DragControls(ref, props))

    dragControls.updateProps(props)

    useEffect(
        () => {
            if (groupDragControls)
                return groupDragControls.subscribe(dragControls)
        },
        [dragControls]
    )

    // {
    //     drag = false,
    //     dragDirectionLock = false,
    //     dragPropagation = false,
    //     dragConstraints = false,
    //     dragElastic = true,
    //     dragMomentum = true,
    //     dragControls: groupDragControls,
    //     _dragValueX,
    //     _dragValueY,
    //     _dragTransitionControls,
    //     dragOriginX,
    //     dragOriginY,
    //     dragTransition,
    //     onDirectionLock,
    //     onDragStart,
    //     onDrag,
    //     onDragEnd,
    //     onDragTransitionEnd,
    // }

    // const scalePoint = () => {
    //     if (!isRefObject(dragConstraints)) return

    //     const constraintsBox = getBoundingBox(
    //         dragConstraints,
    //         transformPagePoint
    //     )
    //     const draggableBox = getBoundingBox(ref, transformPagePoint)

    //     // Scale a point relative to the transformation of a constraints-providing element.
    //     const scaleAxisPoint = (
    //         axis: "x" | "y",
    //         dimension: "width" | "height"
    //     ) => {
    //         const pointToScale = point[axis]
    //         if (!pointToScale) return

    //         // Stop any current animations as they bug out if you resize during one
    //         if (pointToScale.isAnimating()) {
    //             pointToScale.stop()
    //             recordBoxInfo()
    //             return
    //         }

    //         // If the previous dimension was `0` (default), set `scale` to `1` to prevent
    //         // divide by zero errors.
    //         const scale = prevConstraintsBox[dimension]
    //             ? (constraintsBox[dimension] - draggableBox[dimension]) /
    //               prevConstraintsBox[dimension]
    //             : 1

    //         pointToScale.set(prevConstraintsBox[axis] * scale)
    //     }

    //     scaleAxisPoint("x", "width")
    //     scaleAxisPoint("y", "height")
    // }

    //useResize(dragConstraints, scalePoint)

    ///////////

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
        if (!shouldDrag(axis, drag, dragControls.currentDirection)) return
        const defaultValue = axis === "x" ? _dragValueX : _dragValueY
        dragControls.setPoint(axis, defaultValue || values.get(axis, 0))
    })

    //////////

    usePointerEvent(ref, "pointerdown", (event, info) => {
        drag && dragControls.start(event, info)
    })

    useUnmountEffect(() => dragControls.cancelDrag())
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
