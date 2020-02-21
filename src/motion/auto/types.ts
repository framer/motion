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

export interface Style {
    opacity: number
    color: string
    backgroundColor: string
    borderRadius: number
}

export interface Snapshot {
    layout: Box
    style: Style
}
