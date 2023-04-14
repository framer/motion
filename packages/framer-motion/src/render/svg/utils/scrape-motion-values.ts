import { MotionProps } from "../../../motion/types"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { scrapeMotionValuesFromProps as scrapeHTMLMotionValuesFromProps } from "../../html/utils/scrape-motion-values"
import { transformPropOrder } from "../../html/utils/transform"

export function scrapeMotionValuesFromProps(
    props: MotionProps,
    prevProps: MotionProps
) {
    const newValues = scrapeHTMLMotionValuesFromProps(props, prevProps)

    for (const key in props) {
        if (isMotionValue(props[key]) || isMotionValue(prevProps[key])) {
            const targetKey =
                transformPropOrder.indexOf(key) !== -1
                    ? "attr" + key.charAt(0).toUpperCase() + key.substring(1)
                    : key

            newValues[targetKey] = props[key]
        }
    }

    return newValues
}
