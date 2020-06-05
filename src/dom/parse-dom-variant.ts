import { resolveCSSVariables } from "./css-variables-conversion"
import { unitConversion } from "./unit-type-conversion"
import { MakeTargetAnimatable } from "../animation/VisualElementAnimationControls"

export const parseDomVariant: MakeTargetAnimatable = (
    visualElement,
    target,
    origin,
    transitionEnd
) => {
    const resolved = resolveCSSVariables(visualElement, target, transitionEnd)
    target = resolved.target
    transitionEnd = resolved.transitionEnd

    return unitConversion(visualElement, target, origin, transitionEnd)
}
