import { isMotionValue } from "framer-motion";
const axes = ["x", "y", "z"];
const valueMap = {
    "position-x": "x",
    "position-y": "y",
    "position-z": "z",
    "rotation-x": "rotateX",
    "rotation-y": "rotateY",
    "rotation-z": "rotateZ",
    "scale-x": "scaleX",
    "scale-y": "scaleY",
    "scale-z": "scaleZ",
};
export const scrapeMotionValuesFromProps = (props, prevProps) => {
    const motionValues = {};
    let key;
    for (key in props) {
        const prop = props[key];
        if (isMotionValue(prop) || isMotionValue(prevProps[key])) {
            const valueKey = valueMap[key] || key;
            motionValues[valueKey] = prop;
        }
        else if (Array.isArray(prop)) {
            for (let i = 0; i < prop.length; i++) {
                const value = prop[i];
                const prevValue = prevProps[key];
                const prevArrayValue = Array.isArray(prevValue)
                    ? prevValue[i]
                    : undefined;
                if (isMotionValue(value) ||
                    (prevArrayValue !== undefined &&
                        isMotionValue(prevArrayValue))) {
                    const name = valueMap[`${key}-${axes[i]}`];
                    motionValues[name] = value;
                }
            }
        }
    }
    return motionValues;
};
//# sourceMappingURL=scrape-motion-value.js.map