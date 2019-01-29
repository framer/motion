import { RefObject, useContext, useMemo, useRef } from "react"
import { usePanGesture, PanInfo } from "../gestures"
import { createLock, Lock } from "./utils/lock"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { MotionContext } from "../motion/utils/MotionContext"
import { Point } from "../events"
import { MotionValue } from "../value"
import { mix } from "@popmotion/popcorn"
import { AnimationControls } from "motion"

type DragDirection = "x" | "y"

export type Constraints = {
    left?: number
    right?: number
    top?: number
    bottom?: number
}

export type Overdrag = boolean | number

export interface DraggableProps {
    /**
     * Enable dragging for this element
     *
     * Set "x" or "y" to only drag in a specific direction
     * Set "lockDirection" to lock dragging into the initial direction
     *  @default false
     */
    drag?: boolean | DragDirection | "lockDirection"

    /**
     * Disable global drag locking
     * When using nested dragging, setting this to true will enable parents to also drag
     * @default false
     */
    dragPropagation?: boolean

    /**
     * Apply constraints to dragging
     * @default false
     */
    dragConstraints?: Constraints

    /**
     * Allow "overdragging" beyond the drag constraints
     * @default false
     */
    overdrag?: Overdrag

    /**
     * Allow smooth scrolling
     * @default false
     */
    dragMomentum?: boolean

    onDragStart?: (e: MouseEvent | TouchEvent) => void
    onDragEnd?: (e: MouseEvent | TouchEvent) => void
    onDirectionLock?: (axis: string) => void
}

function shouldDrag(
    direction: DragDirection,
    drag: boolean | DragDirection | "lockDirection",
    currentDirection: null | DragDirection
) {
    return (
        (drag === true || drag === "lockDirection" || drag === direction) &&
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

const applyOverdrag = (origin: number, current: number, overdrag: Overdrag) => {
    const dragFactor = typeof overdrag === "number" ? overdrag : 0.5
    return mix(origin, current, dragFactor)
}

type MotionPoint = Partial<{
    x: MotionValue<number>
    y: MotionValue<number>
}>

export function useDraggable(
    {
        drag = false,
        dragPropagation = false,
        dragConstraints,
        overdrag = true,
        dragMomentum = true,
        onDragStart,
        onDragEnd,
        onDirectionLock,
    }: DraggableProps,
    ref: RefObject<Element | null>,
    values: MotionValuesMap,
    controls: AnimationControls
) {
    const point = useRef<MotionPoint>({}).current
    const origin = useRef({ x: 0, y: 0 }).current
    const motionContext = useContext(MotionContext)

    const handlers = useMemo(
        () => {
            if (!drag) return {}

            let currentDirection: null | DragDirection = null
            let openGlobalLock: null | Lock = null

            if (shouldDrag("x", drag, currentDirection)) {
                point.x = values.get("x", 0)
            }
            if (shouldDrag("y", drag, currentDirection)) {
                point.y = values.get("y", 0)
            }

            const updatePoint = (
                axis: "x" | "y",
                offset: { x: number; y: number }
            ) => {
                const p = point[axis]
                if (!shouldDrag(axis, drag, currentDirection) || !p) return

                let current = origin[axis] + offset[axis]

                if (dragConstraints) {
                    const { min, max } = getConstraints(axis, dragConstraints)

                    if (min !== undefined && current < min) {
                        current = overdrag
                            ? applyOverdrag(min, current, overdrag)
                            : Math.max(min, current)
                    } else if (max !== undefined && current > max) {
                        current = overdrag
                            ? applyOverdrag(max, current, overdrag)
                            : Math.min(max, current)
                    }
                }

                p.set(current)
            }

            const onPanStart = (event: MouseEvent | TouchEvent) => {
                if (point.x) {
                    origin.x = point.x.get()
                    point.x.stop()
                }
                if (point.y) {
                    origin.y = point.y.get()
                    point.y.stop()
                }

                if (!dragPropagation) {
                    openGlobalLock = getGlobalLock(drag)

                    if (!openGlobalLock) {
                        return
                    }
                }
                currentDirection = null
                motionContext.dragging = true

                onDragStart && onDragStart(event)
            }

            const onPan = (
                _event: MouseEvent | TouchEvent,
                { offset }: PanInfo
            ) => {
                if (!dragPropagation && !openGlobalLock) {
                    return
                }

                if (drag === "lockDirection") {
                    if (currentDirection === null) {
                        currentDirection = getCurrentDirection(offset)

                        if (currentDirection !== null) {
                            onDirectionLock && onDirectionLock(currentDirection)
                        }
                        return
                    }
                }

                updatePoint("x", offset)
                updatePoint("y", offset)
            }

            const onPanEnd = (
                event: MouseEvent | TouchEvent,
                { velocity }: PanInfo
            ) => {
                if (!dragPropagation && openGlobalLock) {
                    openGlobalLock()
                }

                if (dragMomentum) {
                    const startMomentum = (axis: "x" | "y") => {
                        if (!shouldDrag(axis, drag, currentDirection)) return

                        const transition = dragConstraints
                            ? getConstraints(axis, dragConstraints)
                            : {}

                        controls.start({
                            [axis]: 0,
                            transition: {
                                type: "inertia",
                                velocity: velocity[axis],
                                bounceStiffness: 200,
                                bounceDamping: 40,
                                timeConstant: 325,
                                restDelta: 1,
                                ...transition,
                            },
                        })
                    }

                    startMomentum("x")
                    startMomentum("y")
                }

                motionContext.dragging = false
                onDragEnd && onDragEnd(event)
            }

            return { onPanStart, onPan, onPanEnd }
        },
        [drag, motionContext.dragging]
    )

    usePanGesture(handlers, ref)
}

function getCurrentDirection(offset: Point): DragDirection | null {
    const lockThreshold = 10
    let direction: DragDirection | null = null
    if (Math.abs(offset.y) > lockThreshold) {
        direction = "y"
    } else if (Math.abs(offset.x) > lockThreshold) {
        direction = "x"
    }
    return direction
}

const globalHorizontalLock = createLock("dragHorizontal")
const globalVerticalLock = createLock("dragVertical")
function getGlobalLock(drag: boolean | "x" | "y" | "lockDirection"): Lock {
    let lock: Lock = false
    if (drag === "y") {
        lock = globalVerticalLock()
    } else if (drag === "x") {
        lock = globalHorizontalLock()
    } else {
        const openHorizontal = globalHorizontalLock()
        const openVertical = globalVerticalLock()
        if (openHorizontal && openVertical) {
            lock = () => {
                openHorizontal()
                openVertical()
            }
        } else {
            // Release the locks because we don't use them
            if (openHorizontal) openHorizontal()
            if (openVertical) openVertical()
        }
    }
    return lock
}
