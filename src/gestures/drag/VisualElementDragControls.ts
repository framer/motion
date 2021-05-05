import { RefObject } from "react"
import { invariant } from "hey-listen"
import { PanSession, AnyPointerEvent, PanInfo } from "../../gestures/PanSession"
import { DraggableProps, DragHandler, ResolvedConstraints } from "./types"
import { Lock, getGlobalLock } from "./utils/lock"
import { isRefObject } from "../../utils/is-ref-object"
import { addPointerEvent } from "../../events/use-pointer-event"
import { addDomEvent } from "../../events/use-dom-event"
import { getViewportPointFromEvent } from "../../events/event-info"
import { TransformPoint2D, AxisBox2D, Point2D } from "../../types/geometry"
import {
    convertBoundingBoxToAxisBox,
    convertAxisBoxToBoundingBox,
    axisBox,
} from "../../utils/geometry"
import { eachAxis } from "../../utils/each-axis"
import {
    calcRelativeConstraints,
    calcConstrainedMinPoint,
    calcViewportConstraints,
    calcPositionFromProgress,
    applyConstraints,
    rebaseAxisConstraints,
    resolveDragElastic,
    defaultElastic,
} from "./utils/constraints"
import { getBoundingBox } from "../../render/dom/projection/measure"
import { calcOrigin } from "../../utils/geometry/delta-calc"
import { startAnimation } from "../../animation/utils/transitions"
import { Transition } from "../../types"
import { AnimationType } from "../../render/utils/types"
import { VisualElement } from "../../render/types"
import { MotionProps } from "../../motion/types"
import {
    collectProjectingAncestors,
    collectProjectingChildren,
    updateLayoutMeasurement,
} from "../../render/dom/projection/utils"
import { progress } from "popmotion"
import { convertToRelativeProjection } from "../../render/dom/projection/convert-to-relative"
import { calcRelativeOffset } from "../../motion/features/layout/utils"
import { batchLayout, flushLayout } from "../../render/dom/utils/batch-layout"
import { flushSync } from "framesync"

export const elementDragControls = new WeakMap<
    VisualElement,
    VisualElementDragControls
>()

interface DragControlConfig {
    visualElement: VisualElement
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
     * The per-axis resolved elastic values.
     *
     * @internal
     */
    private elastic: AxisBox2D = axisBox()

    /**
     * A reference to the host component's latest props.
     *
     * @internal
     */
    private props: DragControlsProps & MotionProps = {}

    /**
     * @internal
     */
    private visualElement: VisualElement

    /**
     * @internal
     */
    private hasMutatedConstraints: boolean = false

    /**
     * @internal
     */
    private cancelLayout?: () => void

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
        const onSessionStart = (event: AnyPointerEvent) => {
            // Stop any animations on both axis values immediately. This allows the user to throw and catch
            // the component.
            this.stopMotion()

            /**
             * Save the initial point. We'll use this to calculate the pointer's position rather
             * than the one we receive when the gesture actually starts. By then, the pointer will
             * have already moved, and the perception will be of the pointer "slipping" across the element
             */
            const initialPoint = getViewportPointFromEvent(event).point

            this.cancelLayout?.()
            this.cancelLayout = batchLayout((read, write) => {
                const ancestors = collectProjectingAncestors(this.visualElement)
                const children = collectProjectingChildren(this.visualElement)
                const tree = [...ancestors, ...children]
                let hasManuallySetCursorOrigin: boolean = false

                /**
                 * Apply a simple lock to the projection target. This ensures no animations
                 * can run on the projection box while this lock is active.
                 */
                this.isLayoutDrag() && this.visualElement.lockProjectionTarget()

                write(() => {
                    tree.forEach((element) => element.resetTransform())
                })

                read(() => {
                    updateLayoutMeasurement(this.visualElement)
                    children.forEach(updateLayoutMeasurement)
                })

                write(() => {
                    tree.forEach((element) => element.restoreTransform())

                    if (snapToCursor) {
                        hasManuallySetCursorOrigin = this.snapToCursor(
                            initialPoint
                        )
                    }
                })

                read(() => {
                    const isRelativeDrag = Boolean(
                        this.getAxisMotionValue("x") && !this.isExternalDrag()
                    )

                    if (!isRelativeDrag) {
                        this.visualElement.rebaseProjectionTarget(
                            true,
                            this.visualElement.measureViewportBox(false)
                        )
                    }

                    this.visualElement.scheduleUpdateLayoutProjection()

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
                    const { projection } = this.visualElement

                    eachAxis((axis) => {
                        if (!hasManuallySetCursorOrigin) {
                            const { min, max } = projection.target[axis]
                            this.cursorProgress[axis] = cursorProgress
                                ? cursorProgress[axis]
                                : progress(min, max, initialPoint[axis])
                        }

                        /**
                         * If we have external drag MotionValues, record their origin point. On pointermove
                         * we'll apply the pan gesture offset directly to this value.
                         */
                        const axisValue = this.getAxisMotionValue(axis)
                        if (axisValue) {
                            this.originPoint[axis] = axisValue.get()
                        }
                    })
                })

                write(() => {
                    flushSync.update()
                    flushSync.preRender()
                    flushSync.render()
                    flushSync.postRender()
                })

                read(() => this.resolveDragConstraints())
            })
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

            flushLayout()

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
            this.updateAxis("x", info.point, offset)
            this.updateAxis("y", info.point, offset)

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

    resolveDragConstraints() {
        const { dragConstraints, dragElastic } = this.props
        const { layoutCorrected: layout } = this.visualElement.getLayoutState()

        if (dragConstraints) {
            this.constraints = isRefObject(dragConstraints)
                ? this.resolveRefConstraints(layout, dragConstraints)
                : calcRelativeConstraints(layout, dragConstraints)
        } else {
            this.constraints = false
        }

        this.elastic = resolveDragElastic(dragElastic!)

        /**
         * If we're outputting to external MotionValues, we want to rebase the measured constraints
         * from viewport-relative to component-relative.
         */
        if (this.constraints && !this.hasMutatedConstraints) {
            eachAxis((axis) => {
                if (this.getAxisMotionValue(axis)) {
                    this.constraints[axis] = rebaseAxisConstraints(
                        layout[axis],
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
        this.cancelLayout?.()
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
        this.visualElement.unlockProjectionTarget()
        this.panSession?.end()
        this.panSession = null
        const isDragging = this.isDragging
        this.cancelDrag()

        if (!isDragging) return

        const { velocity } = info
        this.animateDragEnd(velocity)

        this.props.onDragEnd?.(event, info)
    }

    snapToCursor(point: Point2D) {
        return eachAxis((axis) => {
            const { drag } = this.props
            // If we're not dragging this axis, do an early return.
            if (!shouldDrag(axis, drag, this.currentDirection)) return

            const axisValue = this.getAxisMotionValue(axis)
            if (axisValue) {
                const box = this.visualElement.getLayoutState().layout

                const length = box[axis].max - box[axis].min
                const center = box[axis].min + length / 2
                const offset = point[axis] - center
                this.originPoint[axis] = point[axis]
                axisValue.set(offset)
            } else {
                this.cursorProgress[axis] = 0.5
                return true
            }
        }).includes(true)
    }

    /**
     * Update the specified axis with the latest pointer information.
     */
    updateAxis(axis: DragDirection, point: Point2D, offset?: Point2D) {
        const { drag } = this.props

        // If we're not dragging this axis, do an early return.
        if (!shouldDrag(axis, drag, this.currentDirection)) return

        return this.getAxisMotionValue(axis)
            ? this.updateAxisMotionValue(axis, offset)
            : this.updateVisualElementAxis(axis, point)
    }

    updateAxisMotionValue(axis: DragDirection, offset?: Point2D) {
        const axisValue = this.getAxisMotionValue(axis)

        if (!offset || !axisValue) return

        const nextValue = this.originPoint[axis]! + offset[axis]
        const update = this.constraints
            ? applyConstraints(
                  nextValue,
                  this.constraints[axis],
                  this.elastic[axis]
              )
            : nextValue

        axisValue.set(update)
    }

    updateVisualElementAxis(axis: DragDirection, point: Point2D) {
        // Get the actual layout bounding box of the element
        const axisLayout = this.visualElement.getLayoutState().layout[axis]

        // Calculate its current length. In the future we might want to lerp this to animate
        // between lengths if the layout changes as we change the DOM
        const axisLength = axisLayout.max - axisLayout.min

        // Get the initial progress that the pointer sat on this axis on gesture start.
        const axisProgress = this.cursorProgress[axis]

        // Calculate a new min point based on the latest pointer position, constraints and elastic
        const min = calcConstrainedMinPoint(
            point[axis],
            axisLength,
            axisProgress,
            this.constraints?.[axis],
            this.elastic[axis]
        )

        // Update the axis viewport target with this new min and the length
        this.visualElement.setProjectionTargetAxis(axis, min, min + axisLength)
    }

    setProps({
        drag = false,
        dragDirectionLock = false,
        dragPropagation = false,
        dragConstraints = false,
        dragElastic = defaultElastic,
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

    private isLayoutDrag() {
        return !this.getAxisMotionValue("x")
    }

    private isExternalDrag() {
        const { _dragX, _dragY } = this.props
        return _dragX || _dragY
    }

    private animateDragEnd(velocity: Point2D) {
        const { drag, dragMomentum, dragElastic, dragTransition } = this.props

        /**
         * Everything beyond the drag gesture should be performed with
         * relative projection so children stay in sync with their parent element.
         */
        const isRelative = convertToRelativeProjection(
            this.visualElement,
            this.isLayoutDrag() && !this.isExternalDrag()
        )

        /**
         * If we had previously resolved constraints relative to the viewport,
         * we need to also convert those to a relative coordinate space for the animation
         */
        const constraints = this.constraints || {}
        if (
            isRelative &&
            Object.keys(constraints).length &&
            this.isLayoutDrag()
        ) {
            const projectionParent = this.visualElement.getProjectionParent()

            if (projectionParent) {
                const relativeConstraints = calcRelativeOffset(
                    projectionParent.projection.targetFinal,
                    constraints as AxisBox2D
                )

                eachAxis((axis) => {
                    const { min, max } = relativeConstraints[axis]
                    constraints[axis] = {
                        min: isNaN(min) ? undefined : min,
                        max: isNaN(max) ? undefined : max,
                    }
                })
            }
        }

        const momentumAnimations = eachAxis((axis) => {
            if (!shouldDrag(axis, drag, this.currentDirection)) {
                return
            }

            const transition = constraints?.[axis] ?? {}

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
                : this.visualElement.startLayoutAnimation(
                      axis,
                      inertia,
                      isRelative
                  )
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
                this.visualElement.projection.target[axis],
                this.constraintsBox![axis]
            )
        })

        /**
         * For each axis, calculate the current progress of the layout axis within the constraints.
         * Then, using the latest layout and constraints measurements, reposition the new layout axis
         * proportionally within the constraints.
         */
        this.updateConstraints(() => {
            eachAxis((axis) => {
                if (!shouldDrag(axis, drag, null)) return

                // Calculate the position of the targetBox relative to the constraintsBox using the
                // previously calculated progress
                const { min, max } = calcPositionFromProgress(
                    this.visualElement.projection.target[axis],
                    this.constraintsBox![axis],
                    boxProgress[axis]
                )

                this.visualElement.setProjectionTargetAxis(axis, min, max)
            })
        })

        /**
         * If any other draggable components are queuing the same tasks synchronously
         * this will wait until they've all been scheduled before flushing.
         */
        setTimeout(flushLayout, 1)
    }

    updateConstraints(onReady?: () => void) {
        this.cancelLayout = batchLayout((read, write) => {
            const ancestors = collectProjectingAncestors(this.visualElement)

            write(() =>
                ancestors.forEach((element) => element.resetTransform())
            )

            read(() => updateLayoutMeasurement(this.visualElement))

            write(() => {
                ancestors.forEach((element) => element.restoreTransform())
            })

            read(() => {
                this.resolveDragConstraints()
            })

            if (onReady) write(onReady)
        })
    }

    mount(visualElement: VisualElement) {
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
            if (this.isDragging) {
                this.resolveDragConstraints()
            }
        })

        /**
         * If the previous component with this same layoutId was dragging at the time
         * it was unmounted, we want to continue the same gesture on this component.
         */
        const { prevDragCursor } = visualElement
        if (prevDragCursor) {
            this.start(lastPointerEvent, { cursorProgress: prevDragCursor })
        }

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
