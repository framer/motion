import { MotionProps } from "../../motion/types"
import { TransformPoint2D } from "../../types/geometry"

export interface HTMLConfig {
    allowTransformNone?: boolean
    enableHardwareAcceleration?: boolean
    transformPagePoint?: TransformPoint2D
    transformTemplate?: MotionProps["transformTemplate"]
}

export interface TransformOrigin {
    originX?: number
    originY?: number
    originZ?: number
}
