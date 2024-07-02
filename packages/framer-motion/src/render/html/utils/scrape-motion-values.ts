import { MotionProps, MotionStyle } from "../../../motion/types"
import { isForcedMotionValue } from "../../../motion/utils/is-forced-motion-value"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import type { VisualElement } from "../../VisualElement"

export function scrapeMotionValuesFromProps(
    props: MotionProps,
    prevProps: MotionProps,
    visualElement?: VisualElement
) {
    const { style } = props
    const newValues: { [key: string]: any } = {}

    for (const key in style) {
        if (
            isMotionValue(style[key as keyof MotionStyle]) ||
            (prevProps.style &&
                isMotionValue(prevProps.style[key as keyof MotionStyle])) ||
            isForcedMotionValue(key, props) ||
            visualElement?.getValue(key)?.liveStyle !== undefined
        ) {
            newValues[key] = style[key as keyof MotionStyle]
        }
    }

    /**
     * If the willChange style has been manually set as a string, set
     * applyWillChange to false to prevent it from automatically being applied.
     */
    if (visualElement && style && typeof style.willChange === "string") {
        visualElement.applyWillChange = false
    }

    return newValues
}
