import { MotionStyle } from "../../motion/types"
import { motionValue } from "../../value"
import { isMotionValue } from "../../value/utils/is-motion-value"
import { VisualElement } from "../types"

export function updateMotionValuesFromProps(
    element: VisualElement,
    next: MotionStyle,
    prev: MotionStyle
) {
    for (const key in next) {
        const value = next[key]
        if (isMotionValue(value)) {
            element.addValue(key, value)
        } else {
            if (element.hasValue(key) && !isMotionValue(prev[key])) {
                prev[key] !== value && element.getValue(key)!.set(value)
            } else {
                element.addValue(key, motionValue(value))
            }
        }
    }

    // Handle removed values
    for (const key in prev) {
        if (next[key] === undefined) element.removeValue(key)
    }

    return next
}
