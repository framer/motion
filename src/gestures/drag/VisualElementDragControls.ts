import { RefObject } from "react"
import { DraggableProps, DragHandler } from "./types"
import { Lock, getGlobalLock } from "./utils/lock"
import { isRefObject } from "../../utils/is-ref-object"
import { addPointerEvent } from "../../events/use-pointer-event"
import { PanSession, AnyPointerEvent, PanInfo } from "../../gestures/PanSession"
import { invariant } from "hey-listen"
import { progress } from "popmotion"
import { addDomEvent } from "../../events/use-dom-event"
import { getViewportPointFromEvent } from "../../events/event-info"
import { TransformPoint2D, AxisBox2D, Point2D } from "../../types/geometry"
import {
    convertBoundingBoxToAxisBox,
    convertAxisBoxToBoundingBox,
} from "../../utils/geometry"
import { HTMLVisualElement } from "../../render/dom/HTMLVisualElement"
import { eachAxis } from "../../utils/each-axis"
import {
    calcRelativeConstraints,
    calcConstrainedMinPoint,
    ResolvedConstraints,
    calcViewportConstraints,
    calcPositionFromProgress,
    applyConstraints,
    rebaseAxisConstraints,
} from "./utils/constraints"
import { getBoundingBox } from "../../render/dom/layout/measure"
import { calcOrigin } from "../../utils/geometry/delta-calc"
import { startAnimation } from "../../animation/utils/transitions"
import { Transition } from "../../types"
import { MotionProps } from "../../motion"
import { AnimationType } from "../../render/VisualElement/utils/animation-state"

export const elementDragControls = new WeakMap<
    HTMLVisualElement,
    VisualElementDragControls
>()

interface DragControlConfig {
    // TODO: I'd like to work towards making this work generically with VisualElement
    visualElement: HTMLVisualElement
}

export interface DragControlOptions {
    snapToCursor?: boolean
    cursorProgress?: Point2D
}

interface DragControlsProps extends DraggableProps {
    transformPagePoint?: TransformPoint2D
}

type DragDirection = "x" | "y"

/**
 *
 */
let lastPointerEvent: AnyPointerEvent

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
    private props: DragControlsProps & MotionProps = {}

    /**
     * @internal
     */
    private visualElement: HTMLVisualElement

    /**
     * @internal
     */
    private hasMutatedConstraints: boolean = false

    /**
     * Track the initial position of the cursor relative to the dragging element
     * when dragging starts as a value of 0-1 on each axis. We then use this to calculate
     * an ideal bounding box for the VisualElement renderer to project into every frame.
     *
     * @internal
     */
    cursorProgress: Point2D = {
        x: 0.5,
        y: 0.5,
    }

    // When updating _dragX, or _dragY instead of the VisualElement,
    // persist their values between drag gestures.
    private originPoint: {
        x?: number
        y?: number
    } = {}

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

    constructor({ visualElement }: DragControlConfig) {
        this.visualElement = visualElement
        this.visualElement.enableLayoutProjection()
        elementDragControls.set(visualElement, this)
    }

    /**
     * Instantiate a PanSession for the drag gesture
     *
     * @public
     */
    start(
        originEvent: AnyPointerEvent,
        { snapToCursor = false, cursorProgress }: DragControlOptions = {}
    ) {
        /**
         * If this drag session has been manually triggered by the user, it might be from an event
         * outside the draggable element. If snapToCursor is set to true, we need to measure the position
         * of the element and snap it to the cursor.
         */
        snapToCursor && this.snapToCursor(originEvent)

        const onSessionStart = () => {
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

            eachAxis((axis) => {
                const { min, max } = this.visualElement.targetBox[axis]

                this.cursorProgress[axis] = cursorProgress
                    ? cursorProgress[axis]
                    : progress(min, max, point[axis])

                /**
                 * If we have external drag MotionValues, record their origin point. On pointermove
                 * we'll apply the pan gesture offset directly to this value.
                 */
                const axisValue = this.getAxisMotionValue(axis)
                if (axisValue) {
                    this.originPoint[axis] = axisValue.get()
                }
            })

            // Set current drag status
            this.isDragging = true
            this.currentDirection = null

            // Fire onDragStart event
            this.props.onDragStart?.(event, info)
            this.visualElement.animationState?.setActive(
                AnimationType.Drag,
                true
            )
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
            this.updateAxis("x", event, offset)
            this.updateAxis("y", event, offset)

            // Fire onDrag event
            this.props.onDrag?.(event, info)

            // Update the last pointer event
            lastPointerEvent = event
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
        const { visualElement } = this
        visualElement.withoutTransform(() => {
            visualElement.measureLayout()
        })
        visualElement.rebaseTargetBox(
            true,
            visualElement.getBoundingBoxWithoutTransforms()
        )
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

        /**
         * If we're outputting to external MotionValues, we want to rebase the measured constraints
         * from viewport-relative to component-relative.
         */
        if (this.constraints && !this.hasMutatedConstraints) {
            eachAxis((axis) => {
                if (this.getAxisMotionValue(axis)) {
                    this.constraints[axis] = rebaseAxisConstraints(
                        this.visualElement.box[axis],
                        this.constraints[axis]
                    )
                }
            })
        }
    }

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
         * If there's an onMeasureDragConstraints listener we call it and
         * if different constraints are returned, set constraints to that
         */
        if (onMeasureDragConstraints) {
            const userConstraints = onMeasureDragConstraints(
                convertAxisBoxToBoundingBox(measuredConstraints)
            )

            this.hasMutatedConstraints = !!userConstraints

            if (userConstraints) {
                measuredConstraints = convertBoundingBoxToAxisBox(
                    userConstraints
                )
            }
        }

        return measuredConstraints
    }

    cancelDrag() {
        this.isDragging = false
        this.panSession && this.panSession.end()
        this.panSession = null

        if (!this.props.dragPropagation && this.openGlobalLock) {
            this.openGlobalLock()
            this.openGlobalLock = null
        }

        this.visualElement.animationState?.setActive(AnimationType.Drag, false)
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

        onDragEnd?.(event, info)
    }

    snapToCursor(event: AnyPointerEvent) {
        this.prepareBoundingBox()

        eachAxis((axis) => {
            const { drag } = this.props

            // If we're not dragging this axis, do an early return.
            if (!shouldDrag(axis, drag, this.currentDirection)) return

            const axisValue = this.getAxisMotionValue(axis)

            if (axisValue) {
                const { point } = getViewportPointFromEvent(event)
                const { box } = this.visualElement
                const length = box[axis].max - box[axis].min
                const center = box[axis].min + length / 2
                const offset = point[axis] - center
                this.originPoint[axis] = point[axis]
                axisValue.set(offset)
            } else {
                this.cursorProgress[axis] = 0.5
                this.updateVisualElementAxis(axis, event)
            }
        })
    }

    /**
     * Update the specified axis with the latest pointer information.
     */
    updateAxis(axis: DragDirection, event: AnyPointerEvent, offset?: Point2D) {
        const { drag } = this.props

        // If we're not dragging this axis, do an early return.
        if (!shouldDrag(axis, drag, this.currentDirection)) return

        return this.getAxisMotionValue(axis)
            ? this.updateAxisMotionValue(axis, offset)
            : this.updateVisualElementAxis(axis, event)
    }

    updateAxisMotionValue(axis: DragDirection, offset?: Point2D) {
        const axisValue = this.getAxisMotionValue(axis)

        if (!offset || !axisValue) return

        const { dragElastic } = this.props
        const nextValue = this.originPoint[axis]! + offset[axis]
        const update = this.constraints
            ? applyConstraints(
                  nextValue,
                  this.constraints[axis],
                  dragElastic as number
              )
            : nextValue

        axisValue.set(update)
    }

    updateVisualElementAxis(axis: DragDirection, event: AnyPointerEvent) {
        const { dragElastic } = this.props

        // Get the actual layout bounding box of the element
        const axisLayout = this.visualElement.box[axis]

        // Calculate its current length. In the future we might want to lerp this to animate
        // between lengths if the layout changes as we change the DOM
        const axisLength = axisLayout.max - axisLayout.min

        // Get the initial progress that the pointer sat on this axis on gesture start.
        const axisProgress = this.cursorProgress[axis]
        const { point } = getViewportPointFromEvent(event)

        // Calculate a new min point based on the latest pointer position, constraints and elastic
        const min = calcConstrainedMinPoint(
            point[axis],
            axisLength,
            axisProgress,
            this.constraints?.[axis],
            dragElastic as number
        )

        // Update the axis viewport target with this new min and the length
        this.visualElement.setAxisTarget(axis, min, min + axisLength)
    }

    updateProps({
        drag = false,
        dragDirectionLock = false,
        dragPropagation = false,
        dragConstraints = false,
        dragElastic = 0.35,
        dragMomentum = true,
        ...remainingProps
    }: DragControlsProps & MotionProps) {
        this.props = {
            drag,
            dragDirectionLock,
            dragPropagation,
            dragConstraints,
            dragElastic,
            dragMomentum,
            ...remainingProps,
        }
    }

    /**
     * Drag works differently depending on which props are provided.
     *
     * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
     * - If the component will perform layout animations, we output the gesture to the component's
     *      visual bounding box
     * - Otherwise, we apply the delta to the x/y motion values.
     */
    private getAxisMotionValue(axis: DragDirection) {
        const { layout, layoutId } = this.props
        const dragKey = "_drag" + axis.toUpperCase()

        if (this.props[dragKey]) {
            return this.props[dragKey]
        } else if (!layout && layoutId === undefined) {
            return this.visualElement.getValue(axis, 0)
        }
    }

    private animateDragEnd(velocity: Point2D) {
        const { drag, dragMomentum, dragElastic, dragTransition } = this.props

        const momentumAnimations = eachAxis((axis) => {
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

            const inertia = {
                type: "inertia",
                velocity: dragMomentum ? velocity[axis] : 0,
                bounceStiffness,
                bounceDamping,
                timeConstant: 750,
                restDelta: 1,
                restSpeed: 10,
                ...dragTransition,
                ...transition,
            }

            // If we're not animating on an externally-provided `MotionValue` we can use the
            // component's animation controls which will handle interactions with whileHover (etc),
            // otherwise we just have to animate the `MotionValue` itself.
            return this.getAxisMotionValue(axis)
                ? this.startAxisValueAnimation(axis, inertia)
                : this.visualElement.startLayoutAxisAnimation(axis, inertia)
        })

        // Run all animations and then resolve the new drag constraints.
        return Promise.all(momentumAnimations).then(() => {
            this.props.onDragTransitionEnd?.()
        })
    }

    stopMotion() {
        eachAxis((axis) => {
            const axisValue = this.getAxisMotionValue(axis)
            axisValue
                ? axisValue.stop()
                : this.visualElement.stopLayoutAnimation()
        })
    }

    private startAxisValueAnimation(axis: "x" | "y", transition: Transition) {
        const axisValue = this.getAxisMotionValue(axis)
        if (!axisValue) return

        const currentValue = axisValue.get()

        axisValue.set(currentValue)
        axisValue.set(currentValue) // Set twice to hard-reset velocity

        return startAnimation(axis, axisValue, 0, transition)
    }

    scalePoint() {
        const { drag, dragConstraints } = this.props
        if (!isRefObject(dragConstraints) || !this.constraintsBox) return

        // Stop any current animations as there can be some visual glitching if we resize mid animation
        this.stopMotion()

        // Record the relative progress of the targetBox relative to the constraintsBox
        const boxProgress = { x: 0, y: 0 }
        eachAxis((axis) => {
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

        eachAxis((axis) => {
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

    mount(visualElement: HTMLVisualElement) {
        const element = visualElement.getInstance()

        /**
         * Attach a pointerdown event listener on this DOM element to initiate drag tracking.
         */
        const stopPointerListener = addPointerEvent(
            element,
            "pointerdown",
            (event) => {
                const { drag, dragListener = true } = this.props
                drag && dragListener && this.start(event)
            }
        )

        /**
         * Attach a window resize listener to scale the draggable target within its defined
         * constraints as the window resizes.
         */
        const stopResizeListener = addDomEvent(window, "resize", () => {
            this.scalePoint()
        })

        /**
         * Ensure drag constraints are resolved correctly relative to the dragging element
         * whenever its layout changes.
         */
        const stopLayoutUpdateListener = visualElement.onLayoutUpdate(() => {
            if (this.isDragging) this.resolveDragConstraints()
        })

        /**
         * If the previous component with this same layoutId was dragging at the time
         * it was unmounted, we want to continue the same gesture on this component.
         */
        const { prevSnapshot } = visualElement
        prevSnapshot?.isDragging &&
            this.start(lastPointerEvent, {
                cursorProgress: prevSnapshot.cursorProgress,
            })

        /**
         * Return a function that will teardown the drag gesture
         */
        return () => {
            stopPointerListener?.()
            stopResizeListener?.()
            stopLayoutUpdateListener?.()
            this.cancelDrag()
        }
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
    offset: Point2D,
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

export function expectsResolvedDragConstraints({
    dragConstraints,
    onMeasureDragConstraints,
}: MotionProps) {
    return isRefObject(dragConstraints) && !!onMeasureDragConstraints
}
