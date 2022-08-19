import { MotionValue } from "../"

export const isMotionValue = (value: any): value is MotionValue =>
    value?.getVelocity
