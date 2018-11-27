export interface Point {
    x: number
    y: number
}

export interface EventInfo {
    point: Point
    devicePoint: Point
}

export type EventHandler = (event: Event, info: EventInfo) => void
