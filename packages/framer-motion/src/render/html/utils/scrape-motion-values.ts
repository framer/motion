import { MotionProps } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/is-forced-motion-value"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import type { VisualElement } from "../../VisualElement"

export function scrapeMotionValuesFromProps(
    props: MotionProps,
    prevProps: MotionProps,
    visualElement?: VisualElement
) {
    const { style } = props
    const newValues = {}

    for (const key in style) {
        if (
            isMotionValue(style[key]) ||
            (prevProps.style && isMotionValue(prevProps.style[key])) ||
            isForcedMotionValue(key, props) ||
            visualElement?.getValue(key)?.liveStyle !== undefined
        ) {
            newValues[key] = style[key]
        }
    }

    return newValues
}
