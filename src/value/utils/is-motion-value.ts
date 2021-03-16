import { MotionValue } from "../"

export const isMotionValue = (value: any): value is MotionValue => {
    return value !== null && typeof value === "object" && value.getVelocity
}
