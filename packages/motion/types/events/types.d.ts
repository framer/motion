import { RefObject } from "react";
import { Point } from "../projection/geometry/types";
/** @public */
export interface EventInfo {
    point: Point;
}
export declare type EventHandler = (event: MouseEvent | TouchEvent | PointerEvent, info: EventInfo) => void;
export declare type ListenerControls = [() => void, () => void];
export declare type TargetOrRef = EventTarget | RefObject<EventTarget>;
export declare type TargetBasedReturnType<Target> = Target extends EventTarget ? ListenerControls : undefined;
