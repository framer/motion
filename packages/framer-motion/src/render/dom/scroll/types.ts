import { EasingFunction } from "../../../easing/types"

export interface AxisScrollInfo {
    current: number
    offset: number[]
    progress: number
    scrollLength: number
    velocity: number

    // TODO Rename before documenting
    targetOffset: number

    targetLength: number
    containerLength: number
    interpolatorOffsets?: number[]
    interpolate?: EasingFunction
}

export interface ScrollInfo {
    time: number
    x: AxisScrollInfo
    y: AxisScrollInfo
}

export type OnScroll = (info: ScrollInfo) => void

export type OnScrollHandler = {
    measure: () => void
    update: (time: number) => void
    notify: () => void
}

export type SupportedEdgeUnit = "px" | "vw" | "vh" | "%"

export type EdgeUnit = `${number}${SupportedEdgeUnit}`

export type NamedEdges = "start" | "end" | "center"

export type EdgeString = NamedEdges | EdgeUnit | `${number}`

export type Edge = EdgeString | number

export type ProgressIntersection = [number, number]

export type Intersection = `${Edge} ${Edge}`

export type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>

export interface ScrollOptions {
    container?: HTMLElement
    target?: Element
    axis?: "x" | "y"
    offset?: ScrollOffset
    smooth?: number
}
