import { resolveCSSVariables } from "./css-variables-conversion"
import { MotionValuesMap } from "../motion"
import { unitConversion } from "./unit-type-conversion"
import { MakeTargetAnimatable } from "../animation/ValueAnimationControls"
import { VisualElement } from "../dom/VisualElement"

export const parseDomVariant = (
    values: MotionValuesMap,
    visualElement: VisualElement
): MakeTargetAnimatable => {
    return (target, transitionEnd) => {
        const resolved = resolveCSSVariables(
            values,
            visualElement,
            target,
            transitionEnd
        )
        target = resolved.target
        transitionEnd = resolved.transitionEnd

        return unitConversion(values, visualElement, target, transitionEnd)
    }
}
