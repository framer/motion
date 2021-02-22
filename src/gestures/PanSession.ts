import { EventInfo } from "../events/types"
import { isTouchEvent, isMouseEvent } from "./utils/event-type"
import { extractEventInfo } from "../events/event-info"
import sync, { getFrameData, cancelSync } from "framesync"
import { secondsToMilliseconds } from "../utils/time-conversion"
import { addPointerEvent } from "../events/use-pointer-event"
import { distance, pipe } from "popmotion"
import { Point2D, TransformPoint2D } from "../types/geometry"

export type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent

/**
 * Passed in to pan event handlers like `onPan` the `PanInfo` object contains
 * information about the current state of the tap gesture such as its
 * `point`, `delta`, `offset` and `velocity`.
 *
 * @library
 *
 * ```jsx
 * function onPan(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <Frame onPan={onPan} />
 * ```
 *
 * @motion
 *
 * ```jsx
 * <motion.div onPan={(event, info) => {
 *   console.log(info.point.x, info.point.y)
 * }} />
 * ```
 *
 * @public
 */
export interface PanInfo {
    /**
     * Contains `x` and `y` values for the current pan position relative
     * to the device or page.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    point: Point2D
    /**
     * Contains `x` and `y` values for the distance moved since
     * the last event.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.delta.x, info.delta.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.delta.x, info.delta.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    delta: Point2D
    /**
     * Contains `x` and `y` values for the distance moved from
     * the first pan event.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.offset.x, info.offset.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.offset.x, info.offset.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    offset: Point2D
    /**
     * Contains `x` and `y` values for the current velocity of the pointer.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    velocity: Point2D
}

export type PanHandler = (event: Event, info: PanInfo) => void
interface PanSessionHandlers {
    onSessionStart: PanHandler
    onStart: PanHandler
    onMove: PanHandler
    onEnd: PanHandler
}

interface PanSessionOptions {
    transformPagePoint?: TransformPoint2D
}

interface TimestampedPoint extends Point2D {
    timestamp: number
}

/**
 * @internal
 */
export class PanSession {
    /**
     * @internal
     */
    private history: TimestampedPoint[]

    /**
     * @internal
     */
    private startEvent: AnyPointerEvent | null = null

    /**
     * @internal
     */
    private lastMoveEvent: AnyPointerEvent | null = null

    /**
     * @internal
     */
    private lastMoveEventInfo: EventInfo | null = null

    /**
     * @internal
     */
    private transformPagePoint?: TransformPoint2D

    /**
     * @internal
     */
    private handlers: Partial<PanSessionHandlers> = {}

    /**
     * @internal
     */
    private removeListeners: Function

    constructor(
        event: AnyPointerEvent,
        handlers: Partial<PanSessionHandlers>,
        { transformPagePoint }: PanSessionOptions = {}
    ) {
        // If we have more than one touch, don't start detecting this gesture
        if (isTouchEvent(event) && event.touches.length > 1) return

        this.handlers = handlers
        this.transformPagePoint = transformPagePoint

        const info = extractEventInfo(event)
        const initialInfo = transformPoint(info, this.transformPagePoint)
        const { point } = initialInfo

        const { timestamp } = getFrameData()

        this.history = [{ ...point, timestamp }]

        const { onSessionStart } = handlers
        onSessionStart &&
            onSessionStart(event, getPanInfo(initialInfo, this.history))

        this.removeListeners = pipe(
            addPointerEvent(window, "pointermove", this.handlePointerMove),
            addPointerEvent(window, "pointerup", this.handlePointerUp),
            addPointerEvent(window, "pointercancel", this.handlePointerUp)
        )
    }

    private updatePoint = () => {
        if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return

        const info = getPanInfo(this.lastMoveEventInfo, this.history)
        const isPanStarted = this.startEvent !== null

        // Only start panning if the offset is larger than 3 pixels. If we make it
        // any larger than this we'll want to reset the pointer history
        // on the first update to avoid visual snapping to the cursoe.
        const isDistancePastThreshold =
            distance(info.offset, { x: 0, y: 0 }) >= 3

        if (!isPanStarted && !isDistancePastThreshold) return

        const { point } = info
        const { timestamp } = getFrameData()
        this.history.push({ ...point, timestamp })

        const { onStart, onMove } = this.handlers

        if (!isPanStarted) {
            onStart && onStart(this.lastMoveEvent, info)
            this.startEvent = this.lastMoveEvent
        }

        onMove && onMove(this.lastMoveEvent, info)
    }

    private handlePointerMove = (event: AnyPointerEvent, info: EventInfo) => {
        this.lastMoveEvent = event
        this.lastMoveEventInfo = transformPoint(info, this.transformPagePoint)

        // Because Safari doesn't trigger mouseup events when it's above a `<select>`
        if (isMouseEvent(event) && event.buttons === 0) {
            this.handlePointerUp(event, info)
            return
        }

        // Throttle mouse move event to once per frame
        sync.update(this.updatePoint, true)
    }

    private handlePointerUp = (event: AnyPointerEvent, info: EventInfo) => {
        this.end()

        const { onEnd } = this.handlers
        if (!onEnd || !this.startEvent) return

        const panInfo = getPanInfo(
            transformPoint(info, this.transformPagePoint),
            this.history
        )
        onEnd && onEnd(event, panInfo)
    }

    updateHandlers(handlers: Partial<PanSessionHandlers>) {
        this.handlers = handlers
    }

    end() {
        this.removeListeners && this.removeListeners()
        cancelSync.update(this.updatePoint)
    }
}

function transformPoint(
    info: EventInfo,
    transformPagePoint?: (point: Point2D) => Point2D
) {
    return transformPagePoint ? { point: transformPagePoint(info.point) } : info
}

function subtractPoint(a: Point2D, b: Point2D): Point2D {
    return { x: a.x - b.x, y: a.y - b.y }
}

function getPanInfo({ point }: EventInfo, history: TimestampedPoint[]) {
    return {
        point,
        delta: subtractPoint(point, lastDevicePoint(history)),
        offset: subtractPoint(point, startDevicePoint(history)),
        velocity: getVelocity(history, 0.1),
    }
}

function startDevicePoint(history: TimestampedPoint[]): TimestampedPoint {
    return history[0]
}

function lastDevicePoint(history: TimestampedPoint[]): TimestampedPoint {
    return history[history.length - 1]
}

function getVelocity(history: TimestampedPoint[], timeDelta: number): Point2D {
    if (history.length < 2) {
        return { x: 0, y: 0 }
    }

    let i = history.length - 1
    let timestampedPoint: TimestampedPoint | null = null
    const lastPoint = lastDevicePoint(history)
    while (i >= 0) {
        timestampedPoint = history[i]
        if (
            lastPoint.timestamp - timestampedPoint.timestamp >
            secondsToMilliseconds(timeDelta)
        ) {
            break
        }
        i--
    }

    if (!timestampedPoint) {
        return { x: 0, y: 0 }
    }

    const time = (lastPoint.timestamp - timestampedPoint.timestamp) / 1000
    if (time === 0) {
        return { x: 0, y: 0 }
    }

    const currentVelocity = {
        x: (lastPoint.x - timestampedPoint.x) / time,
        y: (lastPoint.y - timestampedPoint.y) / time,
    }

    if (currentVelocity.x === Infinity) {
        currentVelocity.x = 0
    }
    if (currentVelocity.y === Infinity) {
        currentVelocity.y = 0
    }

    return currentVelocity
}
