import { RefObject } from "react"
import { Point2D } from "../types/geometry"

/** @public */
export interface EventInfo {
    point: Point2D
}

export type EventHandler = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: EventInfo
) => void

export type ListenerControls = [() => void, () => void]

export type TargetOrRef = EventTarget | RefObject<EventTarget>

export type TargetBasedReturnType<Target> = Target extends EventTarget
    ? ListenerControls
    : undefined
