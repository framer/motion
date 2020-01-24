import { RefObject } from "react"
import { DraggableProps } from "./types"
import { MotionValue, motionValue } from "../value"
import { Lock, getGlobalLock } from "./utils/lock"
import {
    unblockViewportScroll,
    blockViewportScroll,
} from "./utils/block-viewport-scroll"
import { Point } from "../events/types"
import { ValueAnimationControls, MotionValuesMap } from "../motion"
import { supportsTouchEvents } from "../events/utils"
import { isRefObject } from "../utils/is-ref-object"
import { addPointerEvent } from "../events/use-pointer-event"
import { PanSession, AnyPointerEvent, PanInfo } from "../gestures/PanSession"
import { MotionPlugins } from "../motion/context/MotionPluginContext"
import { invariant } from "hey-listen"
import { mix } from "@popmotion/popcorn"
import { addDomEvent } from "../events/use-dom-event"
import { extractEventInfo } from "../events/event-info"

const noop = (v: any) => v

interface DragControlConfig {
    ref: RefObject<Element>
    values: MotionValuesMap
    controls: ValueAnimationControls
}

export interface DragControlOptions {
    snapToCursor?: boolean
}

interface DragControlsProps extends DraggableProps {
    transformPagePoint: (point: Point) => Point
}

export type Constraints = {
    left?: number
    right?: number
    top?: number
    bottom?: number
}

type DragDirection = "x" | "y"

type MotionPoint = {
    x: MotionValue<number>
    y: MotionValue<number>
}

interface BBox {
    width: number
    height: number
    x: number
    y: number
}

/**
 * Don't block the default pointerdown behaviour of these elements.
 */
const allowDefaultPointerDown = new Set(["INPUT", "TEXTAREA", "SELECT"])

export class DragControls {
    /**
     * Track whether we're currently dragging.
     *
     * @internal
     */
    private isDragging = false

    /**
     * The current direction of drag, or `null` if both.
     *
     * @internal
     */
    private currentDirection: DragDirection | null = null

    /**
     * The permitted t/r/b/l boundaries of travel, in pixels.
     *
     * @internal
     */
    private constraints: Constraints | false = false

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
    private props: DragControlsProps = {
        transformPagePoint: noop,
    }

    /**
     * @internal
     */
    private ref: RefObject<Element>

    /**
     * A reference to the host component's animation controls.
     *
     * @internal
     */
    private controls: ValueAnimationControls

    /**
     * A reference to the host component's motion values.
     *
     * @internal
     */
    private values: MotionValuesMap

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
    private origin: MotionPoint = {
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
    private prevConstraintsBox: BBox = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    }

    constructor({ ref, values, controls }: DragControlConfig) {
        this.ref = ref
        this.values = values
        this.controls = controls
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

        const onSessionStart = (event: AnyPointerEvent) => {
            // Prevent browser-specific behaviours like text selection or Chrome's image dragging.
            if (
                event.target &&
                !allowDefaultPointerDown.has((event.target as Element).tagName)
            ) {
                // On iOS it's important to not `preventDefault` the `touchstart`
                // event, as otherwise clicks won't fire inside the draggable element.
                if (!supportsTouchEvents()) {
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
                const axisPoint = this.point[axis]
                axisPoint && axisPoint.stop()
            })
        }

        const onStart = (event: AnyPointerEvent, info: PanInfo) => {
            // If constraints are an element, resolve them again in case they've updated.
            if (this.constraintsNeedResolution) {
                const { dragConstraints, transformPagePoint } = this.props
                this.constraints = calculateConstraintsFromDom(
                    dragConstraints as RefObject<Element>,
                    this.ref,
                    this.point,
                    transformPagePoint
                )
                this.applyConstraintsToPoint()
            }

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

        this.panSession = new PanSession(originEvent, {
            onSessionStart,
            onStart,
            onMove,
            onEnd,
        })
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

    recordBoxInfo(constraints?: Constraints | false) {
        if (constraints) {
            const { right, left, bottom, top } = constraints
            this.prevConstraintsBox.width = (right || 0) - (left || 0)
            this.prevConstraintsBox.height = (bottom || 0) - (top || 0)
        }

        if (this.point.x) this.prevConstraintsBox.x = this.point.x.get()
        if (this.point.y) this.prevConstraintsBox.y = this.point.y.get()
    }

    snapToCursor(event: AnyPointerEvent) {
        const { transformPagePoint } = this.props
        const { point } = extractEventInfo(event)
        const boundingBox = getBoundingBox(this.ref, transformPagePoint)
        const center = {
            x: boundingBox.width / 2 + boundingBox.left + window.scrollX,
            y: boundingBox.height / 2 + boundingBox.top + window.scrollY,
        }
        const offset = {
            x: point.x - center.x,
            y: point.y - center.y,
        }

        bothAxis(axis => {
            const point = this.point[axis]
            point && this.origin[axis].set(point.get())
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
            this.setPoint(axis, defaultValue || this.values.get(axis, 0))
        })

        // If `dragConstraints` is a React `ref`, we should resolve the constraints once the
        // component has rendered.
        this.constraintsNeedResolution = isRefObject(dragConstraints)
        this.constraints = this.constraintsNeedResolution
            ? this.constraints || false
            : (dragConstraints as Constraints | false)
    }

    private applyConstraintsToPoint(constraints = this.constraints) {
        return bothAxis(axis => {
            const axisPoint = this.point[axis]
            axisPoint &&
                !axisPoint.isAnimating() &&
                applyConstraints(axis, axisPoint, constraints, 0)
        })
    }

    private animateDragEnd(velocity: Point) {
        const {
            drag,
            dragMomentum,
            dragElastic,
            dragTransition,
            _dragTransitionControls,
        } = this.props

        const momentumAnimations = bothAxis(axis => {
            if (!shouldDrag(axis, drag, this.currentDirection)) {
                return
            }

            const transition = this.constraints
                ? getConstraints(axis, this.constraints)
                : {}

            /**
             * Overdamp the boundary spring if `dragElastic` is disabled. There's still a frame
             * of spring animations so we should look into adding a disable spring option to `inertia`.
             * We could do something here where we affect the `bounceStiffness` and `bounceDamping`
             * using the value of `dragElastic`.
             */
            const bounceStiffness = dragElastic ? 200 : 1000000
            const bounceDamping = dragElastic ? 40 : 10000000

            const animationControls = _dragTransitionControls || this.controls
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
        return Promise.all(momentumAnimations).then(() => {
            this.recordBoxInfo(this.constraints)
            this.scalePoint()
            const { onDragTransitionEnd } = this.props
            onDragTransitionEnd && onDragTransitionEnd()
        })
    }

    scalePoint() {
        const { dragConstraints, transformPagePoint } = this.props

        if (!isRefObject(dragConstraints)) return

        const constraintsBox = getBoundingBox(
            dragConstraints,
            transformPagePoint
        )
        const draggableBox = getBoundingBox(this.ref, transformPagePoint)

        // Scale a point relative to the transformation of a constraints-providing element.
        const scaleAxisPoint = (
            axis: "x" | "y",
            dimension: "width" | "height"
        ) => {
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
            const scale = this.prevConstraintsBox[dimension]
                ? (constraintsBox[dimension] - draggableBox[dimension]) /
                  this.prevConstraintsBox[dimension]
                : 1

            pointToScale.set(this.prevConstraintsBox[axis] * scale)
        }

        scaleAxisPoint("x", "width")
        scaleAxisPoint("y", "height")
    }

    mount(element: Element) {
        const stopPointerListener = addPointerEvent(
            element,
            "pointerdown",
            event => this.props.drag && this.start(event)
        )

        const stopResizeListener = addDomEvent(window, "resize", () =>
            this.scalePoint()
        )

        if (this.constraintsNeedResolution) {
            const { dragConstraints, transformPagePoint } = this.props
            const constraints = calculateConstraintsFromDom(
                dragConstraints as RefObject<Element>,
                this.ref,
                this.point,
                transformPagePoint
            )

            this.applyConstraintsToPoint(constraints)
            this.recordBoxInfo(constraints)
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

function getConstraints(
    axis: "x" | "y",
    { top, right, bottom, left }: Constraints
) {
    if (axis === "x") {
        return { min: left, max: right }
    } else {
        return { min: top, max: bottom }
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
    constraintsRef: RefObject<Element>,
    draggableRef: RefObject<Element>,
    point: Partial<MotionPoint>,
    transformPagePoint: MotionPlugins["transformPagePoint"]
) {
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

function getBoundingBox(
    ref: RefObject<Element>,
    transformPagePoint: MotionPlugins["transformPagePoint"]
) {
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

function getCurrentOffset(point?: MotionValue<number>) {
    return point ? point.get() : 0
}

function applyConstraints(
    axis: "x" | "y",
    value: number | MotionValue<number>,
    constraints: Constraints | false,
    dragElastic: boolean | number | undefined
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
