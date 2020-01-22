import { DragHandlers, DraggableProps } from "./types"
import { MotionValue, motionValue } from "../value"
import { Lock } from "./utils/lock"
import { RefObject } from "react"
import { PanInfo } from "../gestures/use-pan-gesture"
import {
    unblockViewportScroll,
    blockViewportScroll,
} from "./utils/block-viewport-scroll"
import { Point } from "events/types"
import { ValueAnimationControls, MotionValuesMap } from "motion"
import { supportsTouchEvents } from "events/utils"

export interface DragControlOptions {
    snapToCursor?: boolean
}

type DragDirection = "x" | "y"

type MotionPoint = Partial<{
    x: MotionValue<number>
    y: MotionValue<number>
}>

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

export class DragControls {
    isDragging = false

    currentDirection = null

    constraints = false

    props: DraggableProps = {}

    point: Partial<MotionPoint> = {}

    origin: MotionPoint

    // This is a reference to the global drag gesture lock, ensuring only one component
    // can "capture" the drag of one or both axes.
    openGlobalLock: Lock | null = null
    panSession: PanSession

    prevConstraintsBox: BBox

    controls: ValueAnimationControls
    values: MotionValuesMap

    constructor(
        ref: RefObject<Element>,
        { dragOriginX, dragOriginY }: Partial<DraggableProps>
    ) {
        this.origin = {
            x: dragOriginX || motionValue(0),
            y: dragOriginY || motionValue(0),
        }
    }

    start(
        event: MouseEvent | TouchEvent | PointerEvent,
        options: DragControlOptions
    ) {
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

        this.panSession = new PanSession({
            onStart: (event, info) => {
                // Resolve the constraints again in case anything has changed in the meantime.
                if (this.constraintsNeedResolution) {
                    this.constraints = calculateConstraintsFromDom(
                        dragConstraints as RefObject<Element>,
                        ref,
                        this.point,
                        transformPagePoint
                    )

                    applyConstraintsToPoint(dragStatus.constraints)
                }

                // Set point origin and stop any existing animations.
                bothAxis(axis => {
                    const axisPoint = this.point[axis]
                    if (!axisPoint) return

                    origin[axis].set(axisPoint.get())
                    axisPoint.stop()
                })

                // Attempt to grab the global drag gesture lock - maybe make this part of PanSession
                if (!dragPropagation) {
                    if (openGlobalLock.current) openGlobalLock.current()
                    openGlobalLock.current = getGlobalLock(drag)

                    if (!openGlobalLock.current) {
                        return
                    }
                }

                this.isDragging = true
                this.currentDirection = null

                const { onDragStart } = this.props
                onDragStart && onDragStart(event, convertPanToDrag(info))
            },
            onMove: (event, info) => {
                const { dragPropagation, dragDirectionLock } = this.props
                // If we didn't successfully receive the gesture lock, early return.
                if (!this.props.dragPropagation && !this.openGlobalLock) {
                    return
                }

                const { offset } = info

                // Attempt to detect drag direction if directionLock is true
                if (dragDirectionLock && this.currentDirection === null) {
                    this.currentDirection = getCurrentDirection(offset)

                    // If we've successfully set a direction, notify listener
                    if (this.currentDirection !== null) {
                        const { onDirectionLock } = this.props
                        onDirectionLock &&
                            onDirectionLock(this.currentDirection)
                    }

                    return
                }

                this.updatePoint("x", offset)
                this.updatePoint("y", offset)

                const { onDrag } = this.props
                onDrag && onDrag(event, convertPanToDrag(info))
            },
            onEnd: (event, info) => {
                this.stop(event, info)
                this.panSession = null
            },
        })
    }

    cancelDrag() {
        unblockViewportScroll()
        this.isDragging = false

        if (!this.props.dragPropagation && this.openGlobalLock) {
            this.openGlobalLock()
            this.openGlobalLock = null
        }
    }

    stop(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        const isDragging = this.isDragging
        this.cancelDrag()

        if (!isDragging) return

        const { dragMomentum, dragElastic, onDragEnd } = this.props
        if (dragMomentum || dragElastic) {
            const { velocity } = InputDeviceInfo
            this.animateDragEnd(velocity)
        } else {
            this.recordBoxInfo(this.constraints)
        }

        onDragEnd && onDragEnd(event, convertPanToDrag(info, this.point))
    }

    setPoint(axis: DragDirection, value: MotionValue<number>) {
        this.point[axis] = value
    }

    updatePoint(axis: DragDirection, offset: { x: number; y: number }) {
        const { drag } = this.props
        const axisPoint = this.point[axis]

        // If we're not dragging this axis, do an early return.
        if (!shouldDrag(axis, drag, this.currentDirection) || !axisPoint) {
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

    updateProps(props: DraggableProps) {
        this.props = props

        // Get the `MotionValue` for both draggable axes, or create them if they don't already
        // exist on this component.
        const { drag, _dragValueX, _dragValueY } = props
        bothAxis(axis => {
            if (!shouldDrag(axis, drag, this.currentDirection)) return
            const defaultValue = axis === "x" ? _dragValueX : _dragValueY
            this.setPoint(axis, defaultValue || this.values.get(axis, 0))
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
}
