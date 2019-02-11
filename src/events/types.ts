import { RefObject } from "react"
import { ServerSafeWindow } from "./utils/window"

export interface Point {
    x: number
    y: number
}

export namespace Point {
    /** @alpha */
    export const subtract = (a: Point, b: Point): Point => {
        return { x: a.x - b.x, y: a.y - b.y }
    }
}

export interface EventInfo {
    point: Point
}

export type EventHandler = (event: Event, info: EventInfo) => void

export type ListenerControls = [() => void, () => void]

export type TargetOrRef = EventTarget | RefObject<EventTarget>

export type TargetBasedReturnType<Target> = Target extends
    | EventTarget
    | ServerSafeWindow
    ? ListenerControls
    : undefined
