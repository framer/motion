import { isWillChangeMotionValue } from "../../value/use-will-change/is"
import { MotionStyle } from "../../motion/types"
import { warnOnce } from "../../utils/warn-once"
import { motionValue } from "../../value"
import { isMotionValue } from "../../value/utils/is-motion-value"
import type { VisualElement } from "../VisualElement"

export function updateMotionValuesFromProps(
    element: VisualElement,
    next: MotionStyle,
    prev: MotionStyle
) {
    const { willChange } = next

    for (const key in next) {
        const nextValue = next[key]
        const prevValue = prev[key]

        if (isMotionValue(nextValue)) {
            /**
             * If this is a motion value found in props or style, we want to add it
             * to our visual element's motion value map.
             */
            element.addValue(key, nextValue)

            if (isWillChangeMotionValue(willChange)) {
                willChange.add(key)
            }

            /**
             * Check the version of the incoming motion value with this version
             * and warn against mismatches.
             */
            if (process.env.NODE_ENV === "development") {
                warnOnce(
                    nextValue.version === "__VERSION__",
                    `Attempting to mix Framer Motion versions ${nextValue.version} with __VERSION__ may not work as expected.`
                )
            }
        } else if (isMotionValue(prevValue)) {
            /**
             * If we're swapping from a motion value to a static value,
             * create a new motion value from that
             */
            element.addValue(key, motionValue(nextValue, { owner: element }))

            if (isWillChangeMotionValue(willChange)) {
                willChange.remove(key)
            }
        } else if (prevValue !== nextValue) {
            /**
             * If this is a flat value that has changed, update the motion value
             * or create one if it doesn't exist. We only want to do this if we're
             * not handling the value with our animation state.
             */
            if (element.hasValue(key)) {
                const existingValue = element.getValue(key)!
                // TODO: Only update values that aren't being animated or even looked at
                !existingValue.hasAnimated && existingValue.set(nextValue)
            } else {
                const latestValue = element.getStaticValue(key)
                element.addValue(
                    key,
                    motionValue(
                        latestValue !== undefined ? latestValue : nextValue,
                        { owner: element }
                    )
                )
            }
        }
    }

    // Handle removed values
    for (const key in prev) {
        if (next[key] === undefined) element.removeValue(key)
    }

    return next
}
