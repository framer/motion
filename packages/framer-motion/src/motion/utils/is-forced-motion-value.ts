import { scaleCorrectors } from "../../projection/styles/scale-correction"
import { MotionProps } from "../.."
import {
    transformProps,
    transformOriginProps,
} from "../../render/html/utils/transform"

export function isForcedMotionValue(
    key: string,
    { layout, layoutId }: MotionProps
) {
    return (
        transformProps.has(key) ||
        transformOriginProps.has(key) ||
        ((layout || layoutId !== undefined) &&
            (!!scaleCorrectors[key] || key === "opacity"))
    )
}
