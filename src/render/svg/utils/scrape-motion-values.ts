import { MotionProps } from "../../../motion/types"
import { isMotionValue } from "../../../value/utils/is-motion-value"
import { scrapeMotionValuesFromProps as scrapeHTMLMotionValuesFromProps } from "../../html/utils/scrape-motion-values"

export function scrapeMotionValuesFromProps(props: MotionProps) {
    const newValues = scrapeHTMLMotionValuesFromProps(props)

    for (let key in props) {
        if (isMotionValue(props[key])) {
            if (key === "x" || key === "y") {
                key = "attr" + key.toUpperCase()
            }
            newValues[key] = props[key]
        }
    }

    return newValues
}
