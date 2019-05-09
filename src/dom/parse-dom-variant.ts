import { resolveCSSVariables } from "./css-variables-conversion"
import { MotionValuesMap } from "../motion"
import { RefObject } from "react"
import { unitConversion } from "./unit-type-conversion"
import { MakeTargetAnimatable } from "../animation/ValueAnimationControls"

export const parseDomVariant = (
    values: MotionValuesMap,
    ref: RefObject<Element>
): MakeTargetAnimatable => {
    return (target, transitionEnd) => {
        const resolved = resolveCSSVariables(values, ref, target, transitionEnd)
        target = resolved.target
        transitionEnd = resolved.transitionEnd

        return unitConversion(values, ref, target, transitionEnd)
    }
}
