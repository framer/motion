import { Magic } from "./Magic"
import { Transition } from "../../types"
import { Easing } from "@popmotion/easing"

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

export type FlushMagicChildren = (handler?: TransitionHandler) => void

export interface MagicBatchTree {
    add: (child: Magic) => void
    flush: FlushMagicChildren
}

export interface MagicAnimationOptions {
    origin?: Snapshot
    target?: Snapshot
    transition?: Transition
    crossfadeEasing?: Easing
    opacityTarget?: number
    crossfade?: boolean
}

export interface MagicMotionProps {
    /**
     * @public
     */
    children: React.ReactNode

    /**
     *
     */
    transition?: Transition

    /**
     *
     */
    crossfade?: boolean

    /**
     *
     */
    dependency?: any

    /**
     *
     */
    supportRotate?: boolean
}

export interface TransitionHandler {
    snapshotTarget: (child: Magic) => void
    startAnimation: (child: Magic) => void
}
