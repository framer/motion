import { resolveCSSVariables } from "./css-variables-conversion"
import { MotionValuesMap } from "../motion"
import { unitConversion } from "./unit-type-conversion"
import { MakeTargetAnimatable } from "../animation/ValueAnimationControls"
import { NativeElement } from "../motion/utils/use-native-element"

export const parseDomVariant = (
    values: MotionValuesMap,
    nativeElement: NativeElement<Element>
): MakeTargetAnimatable => {
    return (target, transitionEnd) => {
        const resolved = resolveCSSVariables(
            values,
            nativeElement,
            target,
            transitionEnd
        )
        target = resolved.target
        transitionEnd = resolved.transitionEnd

        return unitConversion(values, nativeElement, target, transitionEnd)
    }
}
