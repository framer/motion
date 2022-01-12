import { MotionProps } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/is-forced-motion-value"
import { isMotionValue } from "../../../value/utils/is-motion-value"

export function scrapeMotionValuesFromProps(props: MotionProps) {
    const { style } = props
    const newValues = {}

    for (const key in style) {
        if (isMotionValue(style[key]) || isForcedMotionValue(key, props)) {
            newValues[key] = style[key]
        }
    }

    return newValues
}
