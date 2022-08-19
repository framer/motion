import { MotionValue } from "../"

export const isMotionValue = (value: any): value is MotionValue =>
    value === undefined ? false : !!value.getVelocity
