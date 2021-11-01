import { scaleCorrectors } from "../../projection/styles/scale-correction"
import { MotionProps } from "../.."
import {
    isTransformOriginProp,
    isTransformProp,
} from "../../render/html/utils/transform"

export function isForcedMotionValue(
    key: string,
    { layout, layoutId }: MotionProps
) {
    return (
        isTransformProp(key) ||
        isTransformOriginProp(key) ||
        ((layout || layoutId !== undefined) &&
            (!!scaleCorrectors[key] || key === "opacity"))
    )
}
