import { MotionProps } from "../.."
import { valueScaleCorrection } from "../../render/dom/projection/scale-correction"
import {
    isTransformOriginProp,
    isTransformProp,
} from "../../render/dom/utils/transform"

export function isForcedMotionValue(
    key: string,
    { layout, layoutId }: MotionProps
) {
    return (
        isTransformProp(key) ||
        isTransformOriginProp(key) ||
        ((layout || layoutId !== undefined) && !!valueScaleCorrection[key])
    )
}
