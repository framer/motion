import { MotionValue } from "../"

export const isMotionValue = (value: any): value is MotionValue => {
    return value instanceof MotionValue
}
