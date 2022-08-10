import { isMotionValue } from "../utils/is-motion-value"
import { WillChange } from "./types"

export function isWillChangeMotionValue(value: any): value is WillChange {
    return isMotionValue(value) && Object.hasOwnProperty.call(value, "add")
}
