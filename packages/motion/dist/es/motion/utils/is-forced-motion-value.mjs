import { scaleCorrectors } from '../../projection/styles/scale-correction.mjs';
import { isTransformProp, isTransformOriginProp } from '../../render/html/utils/transform.mjs';

function isForcedMotionValue(key, _a) {
    var layout = _a.layout, layoutId = _a.layoutId;
    return (isTransformProp(key) ||
        isTransformOriginProp(key) ||
        ((layout || layoutId !== undefined) &&
            (!!scaleCorrectors[key] || key === "opacity")));
}

export { isForcedMotionValue };
