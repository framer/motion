import { RefObject } from "react"

export interface Point {
    x: number
    y: number
}

export interface EventInfo {
    point: Point
    devicePoint: Point
}

export type EventHandler = (event: Event, info: EventInfo) => void

export type ListenerControls = [() => void, () => void]

export type TargetOrRef = EventTarget | RefObject<EventTarget>

export type TargetBasedReturnType<Target> = Target extends EventTarget ? ListenerControls : undefined
