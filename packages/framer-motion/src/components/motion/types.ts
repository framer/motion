import { MotionStyle } from "../../motion/types"
import type { MotionState } from "./state"

export interface MotionOptions {
    initial: any
    animate: any
    press: any
    hover: any
    inView: any
    inViewOptions: any
    variants: any
    transition: any
}

export interface MotionProps extends MotionOptions {
    style: MotionStyle
}

export type MotionFeature = (state: MotionState) => () => void

export interface MotionFeatures {
    animate?: MotionFeature
    hover?: MotionFeature
    focus?: MotionFeature
    press?: MotionFeature
    inView?: MotionFeature
    layout?: MotionFeature
    drag?: MotionFeature
}
