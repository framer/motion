import { Ref, CSSProperties, ComponentType } from "react"
import { MotionValue } from "../value"
import { AnimationManager } from "../animation"
import { Poses } from "../types"

export type ComponentFactory = <T>(Component: ComponentType<T>) => ComponentType<T & MotionProps>

export type MotionStyle = string | number | MotionValue

export type PoseKeys = string | string[]

export type MotionStyleProperties = {
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
    opacity?: MotionStyle
    perspective?: MotionStyle
    transform?: string
}

export type MotionProps = {
    ref?: Ref<Element>
    style?: CSSProperties & MotionStyleProperties
    animation?: AnimationManager | Poses
    pose?: PoseKeys
    onPoseComplete?: () => void
}

// export type MotionProps<Poses = string> = {
//     [key: string]: any
//     ref?: Ref<any>
//     pose?: Poses | Poses[] | MotionValue
//     motionValues?: { [key: string]: MotionValue }
//     style?: CSSProperties
//     onPoseComplete?: (current: CurrentValues, velocity: VelocityValues) => void
// }
