import { Point, TransformPoint } from "../projection/geometry/types";
export declare type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent;
/**
 * Passed in to pan event handlers like `onPan` the `PanInfo` object contains
 * information about the current state of the tap gesture such as its
 * `point`, `delta`, `offset` and `velocity`.
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
    point: Point;
    /**
     * Contains `x` and `y` values for the distance moved since
     * the last event.
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
    delta: Point;
    /**
     * Contains `x` and `y` values for the distance moved from
     * the first pan event.
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
    offset: Point;
    /**
     * Contains `x` and `y` values for the current velocity of the pointer, in px/ms.
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
    velocity: Point;
}
export declare type PanHandler = (event: Event, info: PanInfo) => void;
interface PanSessionHandlers {
    onSessionStart: PanHandler;
    onStart: PanHandler;
    onMove: PanHandler;
    onEnd: PanHandler;
    onSessionEnd: PanHandler;
}
interface PanSessionOptions {
    transformPagePoint?: TransformPoint;
}
/**
 * @internal
 */
export declare class PanSession {
    /**
     * @internal
     */
    private history;
    /**
     * @internal
     */
    private startEvent;
    /**
     * @internal
     */
    private lastMoveEvent;
    /**
     * @internal
     */
    private lastMoveEventInfo;
    /**
     * @internal
     */
    private transformPagePoint?;
    /**
     * @internal
     */
    private handlers;
    /**
     * @internal
     */
    private removeListeners;
    constructor(event: AnyPointerEvent, handlers: Partial<PanSessionHandlers>, { transformPagePoint }?: PanSessionOptions);
    private updatePoint;
    private handlePointerMove;
    private handlePointerUp;
    updateHandlers(handlers: Partial<PanSessionHandlers>): void;
    end(): void;
}
export {};
