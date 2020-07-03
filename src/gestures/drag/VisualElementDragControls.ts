import { RefObject } from "react"
import { DraggableProps, DragHandler } from "./types"
import { MotionValue, motionValue } from "../../value"
import { Lock, getGlobalLock } from "./utils/lock"
import {
    unblockViewportScroll,
    blockViewportScroll,
} from "./utils/block-viewport-scroll"
import { Point } from "../../events/types"
import { isRefObject } from "../../utils/is-ref-object"
import { addPointerEvent } from "../../events/use-pointer-event"
import { PanSession, AnyPointerEvent, PanInfo } from "../../gestures/PanSession"
import { invariant } from "hey-listen"
import { mix, progress } from "@popmotion/popcorn"
import { addDomEvent } from "../../events/use-dom-event"
import {
    extractEventInfo,
    getViewportPointFromEvent,
} from "../../events/event-info"
import { startAnimation } from "../../animation/utils/transitions"
import {
    TransformPoint2D,
    BoundingBox2D,
    Axis,
    AxisBox2D,
} from "../../types/geometry"
import {
    transformBoundingBox,
    convertBoundingBoxToAxisBox,
    calcAxisCenter,
    convertAxisBoxToBoundingBox,
} from "../../utils/geometry"
import { VisualElement } from "../../render/VisualElement"
import { VisualElementAnimationControls } from "../../animation/VisualElementAnimationControls"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"
import { eachAxis } from "../../utils/each-axis"
import {
    calcRelativeConstraints,
    calcConstrainedMinPoint,
    calcConstraintsFromDom,
    ResolvedConstraints,
    calcProgressWithinConstraints,
    calcViewportConstraints,
    calcPositionFromProgress,
} from "./utils/constraints"
import { getBoundingBox } from "../../render/dom/layout/measure"
import { calcOrigin } from "../../render/dom/layout/delta-calc"

export const elementDragControls = new WeakMap<
    HTMLVisualElement,
    VisualElementDragControls
>()

interface DragControlConfig {
    // TODO: I'd like to work towards making this work generically with VisualElement
    visualElement: HTMLVisualElement
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
    private constraints: ResolvedConstraints | false = false

    /**
     * A reference to the host component's latest props.
     *
     * @internal
     */
    private props: DragControlsProps = {}

    /**
     * @internal
     */
    private visualElement: HTMLVisualElement

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
     * Track the initial position of the cursor relative to the dragging element
     * when dragging starts as a value of 0-1 on each axis. We then use this to calculate
     * an ideal bounding box for the VisualElement renderer to project into every frame.
     *
     * @internal
     */
    private cursorProgress = {
        x: 0.5,
        y: 0.5,
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
     * A reference to the measured constraints bounding box
     */
    private constraintsBox?: AxisBox2D

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
        this.visualElement.enableLayoutReprojection()
        this.controls = controls
        elementDragControls.set(visualElement, this)
    }

    /**
     * Instantiate a PanSession for the drag gesture
     *
     * @public
     */
    start(
        originEvent: AnyPointerEvent,
        { snapToCursor = false }: DragControlOptions = {}
    ) {
        /**
         * If this drag session has been manually triggered by the user, it might be from an event
         * outside the draggable element. If snapToCursor is set to true, we need to measure the position
         * of the element and snap it to the cursor.
         */
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
            // Attempt to grab the global drag gesture lock - maybe make this part of PanSession
            const { drag, dragPropagation } = this.props
            if (drag && !dragPropagation) {
                if (this.openGlobalLock) this.openGlobalLock()
                this.openGlobalLock = getGlobalLock(drag)

                // If we don 't have the lock, don't start dragging
                if (!this.openGlobalLock) return
            }

            /**
             * Record the progress of the mouse within the draggable element on each axis.
             * onPan, we're going to use this to calculate a new bounding box for the element to
             * project into. This will ensure that even if the DOM element moves via a relayout, it'll
             * stick to the correct place under the pointer.
             */
            this.prepareBoundingBox()
            this.visualElement.lockTargetBox()

            /**
             * Resolve the drag constraints. These are either set as top/right/bottom/left constraints
             * relative to the element's layout, or a ref to another element. Both need converting to
             * viewport coordinates.
             */
            this.resolveDragConstraints()

            /**
             * When dragging starts, we want to find where the cursor is relative to the bounding box
             * of the element. Every frame, we calculate a new bounding box using this relative position
             * and let the visualElement renderer figure out how to reproject the element into this bounding
             * box.
             *
             * By doing it this way, rather than applying an x/y transform directly to the element,
             * we can ensure the component always visually sticks to the cursor as we'd expect, even
             * if the DOM element itself changes layout as a result of React updates the user might
             * make based on the drag position.
             */
            const { point } = getViewportPointFromEvent(event)
            eachAxis(axis => {
                const { min, max } = this.visualElement.targetBox[axis]
                this.cursorProgress[axis] = progress(min, max, point[axis])
            })

            // Set current drag status
            this.isDragging = true
            this.currentDirection = null

            // Fire onDragStart event
            this.fireEventHandler(event, info, this.props.onDragStart)
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
                    this.props.onDirectionLock?.(this.currentDirection)
                }

                return
            }

            // Update each point with the latest position
            this.updatePoint("x", event)
            this.updatePoint("y", event)

            // Fire onDrag event
            this.fireEventHandler(event, info, this.props.onDrag)
        }

        const onEnd: DragHandler = (event, info) => this.stop(event, info)

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

    /**
     * Ensure the component's layout and target bounding boxes are up-to-date.
     */
    prepareBoundingBox() {
        const element = this.visualElement.getInstance()
        const transform = element.style.transform
        this.visualElement.resetTransform()
        this.visualElement.measureLayout()
        element.style.transform = transform
        this.visualElement.refreshTargetBox()
    }

    fireEventHandler(
        event: AnyPointerEvent,
        info: PanInfo,
        handler?: DragHandler
    ) {
        if (handler) handler(event, convertPanToDrag(info, this.point))
    }

    resolveDragConstraints() {
        const { dragConstraints } = this.props

        if (dragConstraints) {
            this.constraints = isRefObject(dragConstraints)
                ? this.resolveRefConstraints(
                      this.visualElement.box,
                      dragConstraints
                  )
                : calcRelativeConstraints(
                      this.visualElement.box,
                      dragConstraints
                  )
        } else {
            this.constraints = false
        }
    }

    /**
     *
     */
    resolveRefConstraints(
        layoutBox: AxisBox2D,
        constraints: RefObject<Element>
    ) {
        const { onMeasureDragConstraints, transformPagePoint } = this.props
        const constraintsElement = constraints.current as Element

        invariant(
            constraintsElement !== null,
            "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop."
        )

        this.constraintsBox = getBoundingBox(
            constraintsElement,
            transformPagePoint
        )
        let measuredConstraints = calcViewportConstraints(
            layoutBox,
            this.constraintsBox
        )

        /**
         * If
         */
        if (onMeasureDragConstraints) {
            const userConstraints = onMeasureDragConstraints(
                convertAxisBoxToBoundingBox(measuredConstraints)
            )
            if (userConstraints) {
                measuredConstraints = convertBoundingBoxToAxisBox(
                    userConstraints
                )
            }
        }

        return measuredConstraints
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
        this.visualElement.unlockTargetBox()
        this.panSession?.end()
        this.panSession = null
        const isDragging = this.isDragging
        this.cancelDrag()

        if (!isDragging) return

        const { dragMomentum, dragElastic, onDragEnd } = this.props
        if (dragMomentum || dragElastic) {
            const { velocity } = info
            this.animateDragEnd(velocity)
        }

        this.fireEventHandler(event, info, onDragEnd)
    }

    snapToCursor(event: AnyPointerEvent) {
        // const { transformPagePoint } = this.props
        // const { point } = extractEventInfo(event)
        // const boundingBox = getBoundingBox(
        //     this.visualElement.getInstance(),
        //     transformPagePoint
        // )
        // const center = {
        //     x: calcAxisCenter(boundingBox.x) + window.scrollX,
        //     y: calcAxisCenter(boundingBox.y) + window.scrollY,
        // }
        // const offset = {
        //     x: point.x - center.x,
        //     y: point.y - center.y,
        // }
        // this.updatePoint("x", offset)
        // this.updatePoint("y", offset)
    }

    updatePoint(axis: DragDirection, event: AnyPointerEvent) {
        const { drag, dragElastic } = this.props

        // If we're not dragging this axis, do an early return.
        if (!shouldDrag(axis, drag, this.currentDirection)) return

        const axisLayout = this.visualElement.box[axis]
        const axisLength = axisLayout.max - axisLayout.min
        const axisProgress = this.cursorProgress[axis]
        const { point } = getViewportPointFromEvent(event)

        const min = calcConstrainedMinPoint(
            point[axis],
            axisLength,
            axisProgress,
            this.constraints?.[axis],
            dragElastic as number
        )

        this.visualElement.setAxisTarget(axis, min, min + axisLength)
    }

    // TODO Let's see if we still need _dragValueX and make this a simple this.props = props if not
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
            dragElastic: dragElastic === true ? 0.35 : dragElastic,
            dragMomentum,
            ...remainingProps,
        }

        const { _dragValueX, _dragValueY } = remainingProps

        // Get the `MotionValue` for both draggable axes, or create them if they don't already
        // exist on this component.
        eachAxis(axis => {
            if (!shouldDrag(axis, drag, this.currentDirection)) return
            const defaultValue = axis === "x" ? _dragValueX : _dragValueY
            this.setPoint(
                axis,
                defaultValue || this.visualElement.getValue(axis, 0)
            )
        })
    }

    setPoint(axis: DragDirection, value: MotionValue<number>) {
        this.point[axis] = value
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

        const momentumAnimations = eachAxis(axis => {
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
                : this.visualElement.startLayoutAxisAnimation(axis, inertia)
        })

        // Run all animations and then resolve the new drag constraints.
        return Promise.all(momentumAnimations).then(() => {
            this.props.onDragTransitionEnd?.()
        })
    }

    stopMotion() {
        this.visualElement.stopLayoutAnimation()
    }

    scalePoint() {
        const { drag, dragConstraints } = this.props
        if (!isRefObject(dragConstraints) || !this.constraintsBox) return

        // Stop any current animations as there can be some visual glitching if we resize mid animation
        this.stopMotion()

        // Record the relative progress of the targetBox relative to the constraintsBox
        const boxProgress = { x: 0, y: 0 }
        eachAxis(axis => {
            boxProgress[axis] = calcOrigin(
                this.visualElement.targetBox[axis],
                this.constraintsBox![axis]
            )
        })

        /**
         * For each axis, calculate the current progress of the layout axis within the constraints.
         * Then, using the latest layout and constraints measurements, reposition the new layout axis
         * proportionally within the constraints.
         */
        this.prepareBoundingBox()
        this.resolveDragConstraints()

        eachAxis(axis => {
            if (!shouldDrag(axis, drag, null)) return

            // Calculate the position of the targetBox relative to the constraintsBox using the
            // previously calculated progress
            const { min, max } = calcPositionFromProgress(
                this.visualElement.targetBox[axis],
                this.constraintsBox![axis],
                boxProgress[axis]
            )

            this.visualElement.setAxisTarget(axis, min, max)
        })
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

        // if (this.constraintsNeedResolution) {
        //     this.resolveDragConstraints()
        //     this.recordBoxInfo(this.constraints)
        // } else if (!this.isDragging && this.constraints) {
        //     this.applyConstraintsToPoint()
        // }

        return () => {
            stopPointerListener && stopPointerListener()
            stopResizeListener && stopResizeListener()
            this.cancelDrag()
        }
    }
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
