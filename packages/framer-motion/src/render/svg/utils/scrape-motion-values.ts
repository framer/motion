import { MotionProps } from "../../../motion/types"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { scrapeMotionValuesFromProps as scrapeHTMLMotionValuesFromProps } from "../../html/utils/scrape-motion-values"

export function scrapeMotionValuesFromProps(
    props: MotionProps,
    prevProps: MotionProps
) {
    const newValues = scrapeHTMLMotionValuesFromProps(props, prevProps)

    for (const key in props) {
        if (isMotionValue(props[key]) || isMotionValue(prevProps[key])) {
            const targetKey =
                key === "x" || key === "y" ? "attr" + key.toUpperCase() : key
            newValues[targetKey] = props[key]
        }
    }

    return newValues
}
