import { MotionProps, MotionStyle } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/is-forced-motion-value"
import { isMotionValue } from "../../../value/utils/is-motion-value"

export function scrapeMotionValuesFromProps(
    props: MotionProps,
    prevProps: MotionProps
) {
    const { style } = props
    const newValues: { [key: string]: any } = {}

    for (const key in style) {
        if (
            isMotionValue(style[key as keyof MotionStyle]) ||
            (prevProps.style &&
                isMotionValue(prevProps.style[key as keyof MotionStyle])) ||
            isForcedMotionValue(key, props)
        ) {
            newValues[key] = style[key as keyof MotionStyle]
        }
    }

    return newValues
}
