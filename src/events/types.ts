import { RefObject } from "react"
import { Point } from "../projection/geometry/types"

/** @public */
export interface EventInfo {
    point: Point
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
