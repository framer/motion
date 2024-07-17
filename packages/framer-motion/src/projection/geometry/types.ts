export interface Point {
    x: number
    y: number
}

export interface BoundingBox {
    top: number
    right: number
    bottom: number
    left: number
}

export type TransformPoint = (point: Point) => Point
