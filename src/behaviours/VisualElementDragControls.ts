import { RefObject } from "react"
import { DraggableProps } from "./types"
import { MotionValue, motionValue } from "../value"
import { Lock, getGlobalLock } from "./utils/lock"
import {
    unblockViewportScroll,
    blockViewportScroll,
} from "./utils/block-viewport-scroll"
import { Point } from "../events/types"
import { isRefObject } from "../utils/is-ref-object"
import { addPointerEvent } from "../events/use-pointer-event"
import { PanSession, AnyPointerEvent, PanInfo } from "../gestures/PanSession"
import { invariant } from "hey-listen"
import { mix } from "@popmotion/popcorn"
import { addDomEvent } from "../events/use-dom-event"
import { extractEventInfo } from "../events/event-info"
import { startAnimation } from "../animation/utils/transitions"
import {
    TransformPoint2D,
    BoundingBox2D,
    Axis,
    AxisBox2D,
} from "../types/geometry"
import {
    transformBoundingBox,
    convertBoundingBoxToAxisBox,
    calcAxisCenter,
    convertAxisBoxToBoundingBox,
} from "../utils/geometry"
import { VisualElement } from "../render/VisualElement"
import { VisualElementAnimationControls } from "../animation/VisualElementAnimationControls"

export const elementDragControls = new WeakMap<
    VisualElement,
    VisualElementDragControls
>()

interface DragControlConfig {
    visualElement: VisualElement
    controls: VisualElementAnimationControls
}

export interface DragControlOptions {
    snapToCursor?: boolean
}

interface DragControlsProps extends DraggableProps {
    transformPagePoint?: TransformPoint2D
}

type DragDirection = "x" | "y"

type MotionPoint = {
    x: MotionValue<number>
    y: MotionValue<number>
}

export class VisualElementDragControls {
    /**
     * Track whether we're currently dragging.
     *
     * @internal
     */
    isDragging = false

    /**
     * The current direction of drag, or `null` if both.
     *
     * @internal
     */
    private currentDirection: DragDirection | null = null

    /**
     * The permitted boundaries of travel, in pixels.
     *
     * @internal
     */
    private constraints: AxisBox2D | false = false

    /**
     * If `true`, our constraints need to be resolved from a Element ref
     * passed to props.dragConstraints
     *
     * @internal
     */
    private constraintsNeedResolution: boolean

    /**
     * A reference to the host component's latest props.
     *
     * @internal
     */
    private props: DragControlsProps = {}

    /**
     * @internal
     */
    private visualElement: VisualElement

    /**
     * A reference to the host component's animation controls.
     *
     * @internal
     */
    private controls: VisualElementAnimationControls

    /**
     * References to the MotionValues used for tracking the current dragged point.
     *
     * @internal
     */
    private point: Partial<MotionPoint> = {}

    /**
     * The origin point for the current drag gesture.
     *
     * @internal
     */
    origin: MotionPoint = {
        x: motionValue(0),
        y: motionValue(0),
    }

    // This is a reference to the global drag gesture lock, ensuring only one component
    // can "capture" the drag of one or both axes.
    // TODO: Look into moving this into pansession?
    private openGlobalLock: Lock | null = null

    /**
     * @internal
     */
    private panSession: PanSession | null = null

    /**
     * A reference to the previous constraints bounding box
     *
     * @internal
     */
    private prevConstraints: AxisBox2D
    private prev = {
        x: 0,
        y: 0,
    }

    constructor({ visualElement, controls }: DragControlConfig) {
        this.visualElement = visualElement
        this.controls = controls
        elementDragControls.set(visualElement, this)
    }

    /**
     * Start dragging the host component.
     *
     * @param event - The originating pointer event.
     * @param options -
     *
     * @public
     */
    start(
        originEvent: AnyPointerEvent,
        { snapToCursor = false }: DragControlOptions = {}
    ) {
        snapToCursor && this.snapToCursor(originEvent)

        const onSessionStart = () => {
            // Initiate viewport scroll blocking on touch start. This is a very aggressive approach
            // which has come out of the difficulty in us being able to do this once a scroll gesture
            // has initiated in mobile browsers. This means if there's a horizontally-scrolling carousel
            // on a page we can't let a user scroll the page itself from it. Ideally what we'd do is
            // trigger this once we've got a scroll direction determined. This approach sort-of worked
            // but if the component was dragged too far in a single frame page scrolling would initiate.
            blockViewportScroll()

            // Stop any animations on both axis values immediately. This allows the user to throw and catch
            // the component.
            this.stopMotion()
        }

        const onStart = (event: AnyPointerEvent, info: PanInfo) => {
            // If constraints are an element, resolve them again in case they've updated.
            this.resolveDragConstraints()

            // Set point origin and stop any existing animations.
            bothAxis(axis => {
                const axisPoint = this.point[axis]
                if (!axisPoint) return

                this.origin[axis].set(axisPoint.get())
            })

            // Attempt to grab the global drag gesture lock - maybe make this part of PanSession
            const { drag, dragPropagation } = this.props
            if (drag && !dragPropagation) {
                if (this.openGlobalLock) this.openGlobalLock()
                this.openGlobalLock = getGlobalLock(drag)
                if (!this.openGlobalLock) return
            }

            this.isDragging = true
            this.currentDirection = null
            const { onDragStart } = this.props
            onDragStart &&
                onDragStart(event, convertPanToDrag(info, this.point))
        }

        const onMove = (event: AnyPointerEvent, info: PanInfo) => {
            const { dragPropagation, dragDirectionLock } = this.props

            // If we didn't successfully receive the gesture lock, early return.
            if (!dragPropagation && !this.openGlobalLock) return

            const { offset } = info
            // Attempt to detect drag direction if directionLock is true
            if (dragDirectionLock && this.currentDirection === null) {
                this.currentDirection = getCurrentDirection(offset)
                // If we've successfully set a direction, notify listener
                if (this.currentDirection !== null) {
                    const { onDirectionLock } = this.props
                    onDirectionLock && onDirectionLock(this.currentDirection)
                }
                return
            }

            this.updatePoint("x", offset)
            this.updatePoint("y", offset)
            const { onDrag } = this.props
            onDrag && onDrag(event, convertPanToDrag(info, this.point))
        }

        const onEnd = (event: AnyPointerEvent, info: PanInfo) => {
            this.stop(event, info)
        }

        const { transformPagePoint } = this.props
        this.panSession = new PanSession(
            originEvent,
            {
                onSessionStart,
                onStart,
                onMove,
                onEnd,
            },
            { transformPagePoint }
        )
    }

    resolveDragConstraints() {
        if (!this.constraintsNeedResolution) return

        const {
            dragConstraints,
            onMeasureDragConstraints,
            transformPagePoint,
        } = this.props
        const constraintsElement = (dragConstraints as RefObject<Element>)
            .current as Element

        this.constraints = calculateConstraintsFromDom(
            constraintsElement,
            this.visualElement.getInstance(),
            this.point,
            transformPagePoint
        )

        if (onMeasureDragConstraints) {
            const constraints = onMeasureDragConstraints(
                convertAxisBoxToBoundingBox(this.constraints)
            )

            if (constraints)
                this.constraints = convertBoundingBoxToAxisBox(constraints)
        }

        this.applyConstraintsToPoint()
    }

    cancelDrag() {
        unblockViewportScroll()
        this.isDragging = false
        this.panSession && this.panSession.end()
        this.panSession = null

        if (!this.props.dragPropagation && this.openGlobalLock) {
            this.openGlobalLock()
            this.openGlobalLock = null
        }
    }

    stop(event: AnyPointerEvent, info: PanInfo) {
        this.panSession?.end()
        this.panSession = null
        const isDragging = this.isDragging
        this.cancelDrag()

        if (!isDragging) return

        const { dragMomentum, dragElastic, onDragEnd } = this.props
        if (dragMomentum || dragElastic) {
            const { velocity } = info
            this.animateDragEnd(velocity)
        } else {
            this.recordBoxInfo(this.constraints)
        }

        onDragEnd && onDragEnd(event, convertPanToDrag(info, this.point))
    }

    recordBoxInfo(constraints?: AxisBox2D | false) {
        if (constraints) this.prevConstraints = constraints
        if (this.point.x) this.prev.x = this.point.x.get()
        if (this.point.y) this.prev.y = this.point.y.get()
    }

    snapToCursor(event: AnyPointerEvent) {
        const { transformPagePoint } = this.props
        const { point } = extractEventInfo(event)
        const boundingBox = getBoundingBox(
            this.visualElement.getInstance(),
            transformPagePoint
        )

        const center = {
            x: calcAxisCenter(boundingBox.x) + window.scrollX,
            y: calcAxisCenter(boundingBox.y) + window.scrollY,
        }

        const offset = {
            x: point.x - center.x,
            y: point.y - center.y,
        }

        bothAxis(axis => {
            const axisPoint = this.point[axis]

            if (!axisPoint) return
            this.origin[axis].set(axisPoint.get())
        })

        this.updatePoint("x", offset)
        this.updatePoint("y", offset)
    }

    setPoint(axis: DragDirection, value: MotionValue<number>) {
        this.point[axis] = value
    }

    updatePoint(axis: DragDirection, offset: { x: number; y: number }) {
        const { drag, dragElastic } = this.props
        const axisPoint = this.point[axis]

        // If we're not dragging this axis, do an early return.
        if (!shouldDrag(axis, drag, this.currentDirection) || !axisPoint) return

        const current = applyConstraints(
            axis,
            this.origin[axis].get() + offset[axis],
            this.constraints,
            dragElastic
        )

        axisPoint.set(current)
    }

    updateProps({
        drag = false,
        dragDirectionLock = false,
        dragPropagation = false,
        dragConstraints = false,
        dragElastic = true,
        dragMomentum = true,
        ...remainingProps
    }: DragControlsProps) {
        this.props = {
            drag,
            dragDirectionLock,
            dragPropagation,
            dragConstraints,
            dragElastic,
            dragMomentum,
            ...remainingProps,
        }

        const {
            _dragValueX,
            _dragValueY,
            dragOriginX,
            dragOriginY,
        } = remainingProps
        if (dragOriginX) this.origin.x = dragOriginX
        if (dragOriginY) this.origin.y = dragOriginY

        // Get the `MotionValue` for both draggable axes, or create them if they don't already
        // exist on this component.
        bothAxis(axis => {
            if (!shouldDrag(axis, drag, this.currentDirection)) return
            const defaultValue = axis === "x" ? _dragValueX : _dragValueY
            this.setPoint(
                axis,
                defaultValue || this.visualElement.getValue(axis, 0)
            )
        })

        // If `dragConstraints` is a React `ref`, we should resolve the constraints once the
        // component has rendered.
        this.constraintsNeedResolution = isRefObject(dragConstraints)

        if (this.constraintsNeedResolution) {
            this.constraints = this.constraints || false
        } else {
            this.constraints =
                dragConstraints && dragConstraints !== false
                    ? convertBoundingBoxToAxisBox(
                          dragConstraints as BoundingBox2D
                      )
                    : false
        }
    }

    private applyConstraintsToPoint() {
        return bothAxis(axis => {
            const axisPoint = this.point[axis]
            axisPoint &&
                !axisPoint.isAnimating() &&
                applyConstraints(axis, axisPoint, this.constraints, 0)
        })
    }

    private animateDragEnd(velocity: Point) {
        const {
            drag,
            dragMomentum,
            dragElastic,
            dragTransition,
            _dragValueX,
            _dragValueY,
            _dragTransitionControls,
        } = this.props

        const momentumAnimations = bothAxis(axis => {
            if (!shouldDrag(axis, drag, this.currentDirection)) {
                return
            }

            const transition = this.constraints ? this.constraints[axis] : {}

            /**
             * Overdamp the boundary spring if `dragElastic` is disabled. There's still a frame
             * of spring animations so we should look into adding a disable spring option to `inertia`.
             * We could do something here where we affect the `bounceStiffness` and `bounceDamping`
             * using the value of `dragElastic`.
             */
            const bounceStiffness = dragElastic ? 200 : 1000000
            const bounceDamping = dragElastic ? 40 : 10000000

            const animationControls = _dragTransitionControls || this.controls

            const inertia = {
                type: "inertia",
                velocity: dragMomentum ? velocity[axis] : 0,
                bounceStiffness,
                bounceDamping,
                timeConstant: 750,
                restDelta: 1,
                ...dragTransition,
                ...transition,
            }

            const externalAxisMotionValue =
                axis === "x" ? _dragValueX : _dragValueY

            // If we're not animating on an externally-provided `MotionValue` we can use the
            // component's animation controls which will handle interactions with whileHover (etc),
            // otherwise we just have to animate the `MotionValue` itself.
            return externalAxisMotionValue
                ? startAnimation(axis, externalAxisMotionValue, 0, inertia)
                : animationControls.start({
                      [axis]: 0,
                      transition: inertia,
                  })
        })

        // Run all animations and then resolve the new drag constraints.
        return Promise.all(momentumAnimations).then(() => {
            this.recordBoxInfo(this.constraints)
            this.scalePoint()
            const { onDragTransitionEnd } = this.props
            onDragTransitionEnd && onDragTransitionEnd()
        })
    }

    stopMotion() {
        bothAxis(axis => {
            const axisPoint = this.point[axis]
            axisPoint && axisPoint.stop()
        })
    }

    scalePoint() {
        const { dragConstraints, transformPagePoint } = this.props

        if (!isRefObject(dragConstraints)) return

        const constraintsBox = getBoundingBox(
            dragConstraints.current as Element,
            transformPagePoint
        )

        const draggableBox = getBoundingBox(
            this.visualElement.getInstance(),
            transformPagePoint
        )

        // Scale a point relative to the transformation of a constraints-providing element.
        const scaleAxisPoint = (axis: "x" | "y") => {
            const pointToScale = this.point[axis]
            if (!pointToScale) return

            // Stop any current animations as they bug out if you resize during one
            if (pointToScale.isAnimating()) {
                pointToScale.stop()
                this.recordBoxInfo()
                return
            }

            // If the previous dimension was `0` (default), set `scale` to `1` to prevent
            // divide by zero errors.
            const { min, max } = this.prevConstraints[axis]
            const width = max - min
            const constraintsWidth =
                constraintsBox[axis].max - constraintsBox[axis].min
            const draggableWidth =
                draggableBox[axis].max - draggableBox[axis].min
            const scale = width
                ? (constraintsWidth - draggableWidth) / width
                : 1

            pointToScale.set(this.prev[axis] * Math.abs(scale))
        }

        scaleAxisPoint("x")
        scaleAxisPoint("y")
    }

    mount(element: Element) {
        const stopPointerListener = addPointerEvent(
            element,
            "pointerdown",
            event => {
                const { drag, dragListener = true } = this.props
                drag && dragListener && this.start(event)
            }
        )

        const stopResizeListener = addDomEvent(window, "resize", () =>
            this.scalePoint()
        )

        if (this.constraintsNeedResolution) {
            this.resolveDragConstraints()
            this.recordBoxInfo(this.constraints)
        } else if (!this.isDragging && this.constraints) {
            this.applyConstraintsToPoint()
        }

        return () => {
            stopPointerListener && stopPointerListener()
            stopResizeListener && stopResizeListener()
            this.cancelDrag()
        }
    }
}

// Call a handler once for each axis
function bothAxis<T>(handler: (axis: "x" | "y") => T): T[] {
    return [handler("x"), handler("y")]
}

function convertPanToDrag(info: PanInfo, point: Partial<MotionPoint>) {
    return {
        ...info,
        point: {
            x: point.x ? point.x.get() : 0,
            y: point.y ? point.y.get() : 0,
        },
    }
}

function shouldDrag(
    direction: DragDirection,
    drag: boolean | DragDirection | undefined,
    currentDirection: null | DragDirection
) {
    return (
        (drag === true || drag === direction) &&
        (currentDirection === null || currentDirection === direction)
    )
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

/**
 * Takes a parent Element and a draggable Element and returns pixel-based drag constraints.
 *
 * @param constraintsRef
 * @param draggableRef
 */
function calculateConstraintsFromDom(
    constraintsElement: Element,
    draggableElement: Element,
    _point: Partial<MotionPoint>, // TODO: Remove this argument if we keep transform reset
    transformPagePoint?: TransformPoint2D
): AxisBox2D {
    invariant(
        constraintsElement !== null && draggableElement !== null,
        "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop."
    )

    const parentBoundingBox = getBoundingBox(
        constraintsElement,
        transformPagePoint
    )

    const draggableTransform = (draggableElement as HTMLElement).style.transform
    ;(draggableElement as HTMLElement).style.transform = "none"
    const draggableBoundingBox = getBoundingBox(
        draggableElement,
        transformPagePoint
    )
    ;(draggableElement as HTMLElement).style.transform = draggableTransform
    return calculateConstraints(parentBoundingBox, draggableBoundingBox)
}

function calculateAxisConstraints(parentAxis: Axis, draggableAxis: Axis): Axis {
    let min = parentAxis.min - draggableAxis.min
    let max = parentAxis.max - draggableAxis.max

    // If the parent axis is actually smaller than the draggable axis then we can
    // flip the constraints
    if (
        parentAxis.max - parentAxis.min <
        draggableAxis.max - draggableAxis.min
    ) {
        ;[min, max] = [max, min]
    }

    return { min, max }
}

export function calculateConstraints(
    parentBox: AxisBox2D,
    draggableBox: AxisBox2D
): AxisBox2D {
    return {
        x: calculateAxisConstraints(parentBox.x, draggableBox.x),
        y: calculateAxisConstraints(parentBox.y, draggableBox.y),
    }
}

function getBoundingBox(
    element: Element,
    transformPagePoint?: TransformPoint2D
): AxisBox2D {
    const rect = element.getBoundingClientRect()
    return convertBoundingBoxToAxisBox(
        transformBoundingBox(rect, transformPagePoint)
    )
}

// function getCurrentOffset(point?: MotionValue<number>) {
//     return point ? point.get() : 0
// }

function applyConstraints(
    axis: "x" | "y",
    value: number | MotionValue<number>,
    constraints: AxisBox2D | false,
    dragElastic: boolean | number | undefined
): number {
    let constrainedValue = value instanceof MotionValue ? value.get() : value
    if (!constraints) {
        return constrainedValue
    }
    const { min, max } = constraints[axis]

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
