import { scaleCorrectors } from "../../projection/styles/scale-correction";
import { isTransformOriginProp, isTransformProp, } from "../../render/html/utils/transform";
export function isForcedMotionValue(key, _a) {
    var layout = _a.layout, layoutId = _a.layoutId;
    return (isTransformProp(key) ||
        isTransformOriginProp(key) ||
        ((layout || layoutId !== undefined) &&
            (!!scaleCorrectors[key] || key === "opacity")));
}
//# sourceMappingURL=is-forced-motion-value.js.map