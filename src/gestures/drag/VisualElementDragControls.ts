import { invariant } from "hey-listen"
import { PanSession, AnyPointerEvent, PanInfo } from "../../gestures/PanSession"
import { ResolvedConstraints } from "./types"
import { Lock, getGlobalLock } from "./utils/lock"
import { isRefObject } from "../../utils/is-ref-object"
import { addPointerEvent } from "../../events/use-pointer-event"
import {
    calcRelativeConstraints,
    calcViewportConstraints,
    applyConstraints,
    rebaseAxisConstraints,
    resolveDragElastic,
    defaultElastic,
} from "./utils/constraints"
import { AnimationType } from "../../render/utils/types"
import { VisualElement } from "../../render/types"
import { MotionProps } from "../../motion/types"
import { Point } from "../../projection/geometry/types"
import { createBox } from "../../projection/geometry/models"
import { eachAxis } from "../../projection/utils/each-axis"
import { measurePageBox } from "../../projection/utils/measure-page-box"
import { getViewportPointFromEvent } from "../../events/event-info"
import { Transition } from "../../types"
import { startAnimation } from "../../animation/utils/transitions"
import {
    convertBoundingBoxToBox,
    convertBoxToBoundingBox,
} from "../../projection/geometry/conversion"

export const elementDragControls = new WeakMap<
    VisualElement,
    VisualElementDragControls
>()

export interface DragControlOptions {
    snapToCursor?: boolean
    cursorProgress?: Point
}

type DragDirection = "x" | "y"

/**
 *
 */
// let latestPointerEvent: AnyPointerEvent

export class VisualElementDragControls {
    private visualElement: VisualElement

    private panSession?: PanSession

    // This is a reference to the global drag gesture lock, ensuring only one component
    // can "capture" the drag of one or both axes.
    // TODO: Look into moving this into pansession?
    private openGlobalLock: Lock | null = null

    private isDragging = false
    private currentDirection: DragDirection | null = null

    private originPoint: Point = { x: 0, y: 0 }

    /**
     * The permitted boundaries of travel, in pixels.
     */
    private constraints: ResolvedConstraints | false = false

    private hasMutatedConstraints = false

    /**
     * The per-axis resolved elastic values.
     */
    private elastic = createBox()

    constructor(visualElement: VisualElement) {
        this.visualElement = visualElement
    }

    start(
        originEvent: AnyPointerEvent,
        { snapToCursor = false }: DragControlOptions = {}
    ) {
        let initialPoint: Point

        const onSessionStart = (event: AnyPointerEvent) => {
            // Stop any animations on both axis values immediately. This allows the user to throw and catch
            // the component.
            this.stopAnimation()

            /**
             * Save the initial point. We'll use this to calculate the pointer's position rather
             * than the one we receive when the gesture actually starts. By then, the pointer will
             * have already moved, and the perception will be of the pointer "slipping" across the element
             */
            initialPoint = getViewportPointFromEvent(event).point
        }

        const onStart = (event: AnyPointerEvent, info: PanInfo) => {
            // Attempt to grab the global drag gesture lock - maybe make this part of PanSession
            const { drag, dragPropagation, onDragStart } = this.getProps()

            if (drag && !dragPropagation) {
                if (this.openGlobalLock) this.openGlobalLock()
                this.openGlobalLock = getGlobalLock(drag)

                // If we don 't have the lock, don't start dragging
                if (!this.openGlobalLock) return
            }

            // TODO: Block layout animations

            this.isDragging = true
            this.currentDirection = null

            this.resolveConstraints()

            if (snapToCursor) this.snapToCursor(initialPoint)

            /**
             * Record gesture origin
             */
            eachAxis((axis) => {
                this.originPoint[axis] = this.getAxisMotionValue(axis).get()
            })

            // Fire onDragStart event
            onDragStart?.(event, info)
            this.visualElement.animationState?.setActive(
                AnimationType.Drag,
                true
            )
        }

        const onMove = (event: AnyPointerEvent, info: PanInfo) => {
            // latestPointerEvent = event

            const {
                dragPropagation,
                dragDirectionLock,
                onDirectionLock,
                onDrag,
            } = this.getProps()

            // If we didn't successfully receive the gesture lock, early return.
            if (!dragPropagation && !this.openGlobalLock) return

            const { offset } = info
            // Attempt to detect drag direction if directionLock is true
            if (dragDirectionLock && this.currentDirection === null) {
                this.currentDirection = getCurrentDirection(offset)

                // If we've successfully set a direction, notify listener
                if (this.currentDirection !== null) {
                    onDirectionLock?.(this.currentDirection)
                }

                return
            }

            // Update each point with the latest position
            this.updateAxis("x", info.point, offset)
            this.updateAxis("y", info.point, offset)

            onDrag?.(event, info)
        }

        const onSessionEnd = (event: AnyPointerEvent, info: PanInfo) =>
            this.stop(event, info)

        this.panSession = new PanSession(
            originEvent,
            {
                onSessionStart,
                onStart,
                onMove,
                onSessionEnd,
            },
            { transformPagePoint: this.visualElement.getTransformPagePoint() }
        )
    }

    private stop(event: AnyPointerEvent, info: PanInfo) {
        const isDragging = this.isDragging
        this.cancel()
        if (!isDragging) return

        const { velocity } = info
        this.startAnimation(velocity)

        const { onDragEnd } = this.getProps()
        onDragEnd?.(event, info)
    }

    private cancel() {
        // TODO: Unblock layout animations
        this.isDragging = false
        this.panSession?.end()
        this.panSession = undefined

        const { dragPropagation } = this.getProps()
        if (!dragPropagation && this.openGlobalLock) {
            this.openGlobalLock()
            this.openGlobalLock = null
        }

        this.visualElement.animationState?.setActive(AnimationType.Drag, false)
    }

    private updateAxis(axis: DragDirection, _point: Point, offset?: Point) {
        const { drag } = this.getProps()

        // If we're not dragging this axis, do an early return.
        if (!offset || !shouldDrag(axis, drag, this.currentDirection)) return

        const axisValue = this.getAxisMotionValue(axis)
        let next = this.originPoint[axis] + offset[axis]

        // Apply constraints
        if (this.constraints && this.constraints[axis]) {
            next = applyConstraints(
                next,
                this.constraints[axis],
                this.elastic[axis]
            )
        }

        axisValue.set(next)
    }

    private resolveConstraints() {
        const { dragConstraints, dragElastic } = this.getProps()
        const { layout } = this.visualElement.projection || {}
        const prevConstraints = this.constraints

        if (dragConstraints && isRefObject(dragConstraints)) {
            if (!this.constraints) {
                this.constraints = this.resolveRefConstraints()
            }
        } else {
            if (dragConstraints && layout) {
                this.constraints = calcRelativeConstraints(
                    layout,
                    dragConstraints
                )
            } else {
                this.constraints = false
            }
        }

        this.elastic = resolveDragElastic(dragElastic)

        /**
         * If we're outputting to external MotionValues, we want to rebase the measured constraints
         * from viewport-relative to component-relative.
         */
        if (
            prevConstraints !== this.constraints &&
            layout &&
            this.constraints &&
            !this.hasMutatedConstraints
        ) {
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

    private resolveRefConstraints() {
        const {
            dragConstraints: constraints,
            onMeasureDragConstraints,
        } = this.getProps()
        if (!constraints || !isRefObject(constraints)) return false

        const constraintsElement = constraints.current as HTMLElement

        invariant(
            constraintsElement !== null,
            "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop."
        )

        const constraintsBox = measurePageBox(
            constraintsElement,
            this.visualElement.projection!.root!,
            this.visualElement.getTransformPagePoint()
        )

        let measuredConstraints = calcViewportConstraints(
            this.visualElement.projection?.layout!,
            constraintsBox
        )

        /**
         * If there's an onMeasureDragConstraints listener we call it and
         * if different constraints are returned, set constraints to that
         */
        if (onMeasureDragConstraints) {
            const userConstraints = onMeasureDragConstraints(
                convertBoxToBoundingBox(measuredConstraints)
            )

            this.hasMutatedConstraints = !!userConstraints

            if (userConstraints) {
                measuredConstraints = convertBoundingBoxToBox(userConstraints)
            }
        }

        return measuredConstraints
    }

    private startAnimation(velocity: Point) {
        const {
            drag,
            dragMomentum,
            dragElastic,
            dragTransition,
            onDragTransitionEnd,
        } = this.getProps()

        const constraints = this.constraints || {}

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
            return this.startAxisValueAnimation(axis, inertia)
        })

        // Run all animations and then resolve the new drag constraints.
        return Promise.all(momentumAnimations).then(onDragTransitionEnd)
    }

    private startAxisValueAnimation(
        axis: DragDirection,
        transition: Transition
    ) {
        const axisValue = this.getAxisMotionValue(axis)
        return startAnimation(axis, axisValue, 0, transition)
    }

    private stopAnimation() {
        eachAxis((axis) => this.getAxisMotionValue(axis).stop())
    }

    /**
     * Drag works differently depending on which props are provided.
     *
     * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
     * - Otherwise, we apply the delta to the x/y motion values.
     */
    private getAxisMotionValue(axis: DragDirection) {
        const dragKey = "_drag" + axis.toUpperCase()
        const externalMotionValue = this.visualElement.getProps()[dragKey]
        return externalMotionValue
            ? externalMotionValue
            : this.visualElement.getValue(axis, 0)
    }

    private snapToCursor(_point: Point) {}

    addListeners() {
        elementDragControls.set(this.visualElement, this)
        const element = this.visualElement.getInstance()

        /**
         * Attach a pointerdown event listener on this DOM element to initiate drag tracking.
         */
        const stopPointerListener = addPointerEvent(
            element,
            "pointerdown",
            (event) => {
                const { drag, dragListener = true } = this.getProps()
                drag && dragListener && this.start(event)
            }
        )

        const measureDragConstraints = () => {
            const { dragConstraints } = this.getProps()
            if (isRefObject(dragConstraints)) {
                this.constraints = this.resolveRefConstraints()
            }
        }

        const { projection } = this.visualElement

        const stopMeasureLayoutListener = projection!.addEventListener(
            "measure",
            measureDragConstraints,
            { passive: true }
        )

        if (!projection!.layout) projection!.updateLayout()
        measureDragConstraints()

        // TODO: Scale point on resize

        // TODO: If we're resuming from a previous drag gesture, project into the previous box

        return () => {
            stopPointerListener()
            stopMeasureLayoutListener()
        }
    }

    getProps(): MotionProps {
        const props = this.visualElement.getProps()
        const {
            drag = false,
            dragDirectionLock = false,
            dragPropagation = false,
            dragConstraints = false,
            dragElastic = defaultElastic,
            dragMomentum = true,
        } = props
        return {
            ...props,
            drag,
            dragDirectionLock,
            dragPropagation,
            dragConstraints,
            dragElastic,
            dragMomentum,
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

export function expectsResolvedDragConstraints({
    dragConstraints,
    onMeasureDragConstraints,
}: MotionProps) {
    return isRefObject(dragConstraints) && !!onMeasureDragConstraints
}
