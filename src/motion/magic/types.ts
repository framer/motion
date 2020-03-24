import { Magic } from "./Magic"
import { Transition } from "../../types"

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
    borderTopLeftRadius: number
    borderTopRightRadius: number
    borderBottomLeftRadius: number
    borderBottomRightRadius: number
    boxShadow: string
    color: string
    opacity: number
    rotate?: number
}

export interface Snapshot {
    layout: Box
    style: Style
}

export interface MagicControlledTree {
    forceRender: () => void
    register: (child: Magic) => () => void
}

export type GetVisualTarget = (child: Magic) => Snapshot | undefined

export type FlushMagicChildren = (
    stackQuery?: StackQuery,
    opts?: MagicAnimationOptions
) => void

export interface MagicBatchTree {
    add: (child: Magic) => void
    flush: FlushMagicChildren
}

export interface StackQuery {
    isPrevious: (child: Magic) => boolean
    isVisibleExiting: (child: Magic) => boolean
    getVisibleOrigin: (child: Magic) => Snapshot | undefined
    getPreviousOrigin: (child: Magic) => Snapshot | undefined
    getVisibleTarget: (child: Magic) => Snapshot | undefined
}

export interface MagicAnimationOptions {
    origin?: Snapshot
    target?: Snapshot
    transition?: Transition
    opacityEasing?: [number, number, number, number]
}
