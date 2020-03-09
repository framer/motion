export interface Axis {
    min: number
    max: number
}

export interface AxisDelta {
    translate: number
    scale: number
    origin: number
    originPoint: number
}

export interface Box {
    x: Axis
    y: Axis
}

export interface BoxDelta {
    x: AxisDelta
    y: AxisDelta
}

export type BoxShadow = [string, number, number, number, number]

export interface Style {
    backgroundColor: string
    border: string
    borderRadius: number
    boxShadow: string
    color: string
    opacity: number
    rotate?: number
}

export interface Snapshot {
    layout: Box
    style: Style
}
