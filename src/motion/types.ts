import { Ref, CSSProperties } from "react"
import { MotionValue } from "../value"
import { AnimationManager } from "../animation"
import { Poses } from "../types"
import { GestureHandlers } from "../gestures"
import { DraggableProps } from "../behaviours"

export type MotionStyle = string | number | MotionValue

export type PoseKeys = string | string[]

export interface MotionStyleProperties {
    x?: MotionStyle
    y?: MotionStyle
    z?: MotionStyle
    rotate?: MotionStyle
    rotateX?: MotionStyle
    rotateY?: MotionStyle
    rotateZ?: MotionStyle
    scale?: MotionStyle
    scaleX?: MotionStyle
    scaleY?: MotionStyle
    scaleZ?: MotionStyle
    skew?: MotionStyle
    skewX?: MotionStyle
    skewY?: MotionStyle
    originX?: MotionStyle
    originY?: MotionStyle
    originZ?: MotionStyle
    perspective?: MotionStyle
}

type MakeMotion<T> = { [K in keyof T]: T[K] | MotionValue<T[K]> }

export interface MotionProps extends GestureHandlers, DraggableProps {
    ref?: Ref<Element>
    style?: MakeMotion<CSSProperties> & MotionStyleProperties
    animation?: AnimationManager | Poses
    pose?: PoseKeys
    inherit?: boolean
    onPoseComplete?: () => void
}
