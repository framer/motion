import { isMotionValue } from "../../../value/utils/is-motion-value";
import { scrapeMotionValuesFromProps as scrapeHTMLMotionValuesFromProps } from "../../html/utils/scrape-motion-values";
export function scrapeMotionValuesFromProps(props) {
    var newValues = scrapeHTMLMotionValuesFromProps(props);
    for (var key in props) {
        if (isMotionValue(props[key])) {
            var targetKey = key === "x" || key === "y" ? "attr" + key.toUpperCase() : key;
            newValues[targetKey] = props[key];
        }
    }
    return newValues;
}
//# sourceMappingURL=scrape-motion-values.js.map