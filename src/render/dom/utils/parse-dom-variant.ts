import { resolveCSSVariables } from "./css-variables-conversion"
import { MakeTargetAnimatable } from "../../utils/animation"
import { unitConversion } from "./unit-conversion"

/**
 * Parse a DOM variant to make it animatable. This involves resolving CSS variables
 * and ensuring animations like "20%" => "calc(50vw)" are performed in pixels.
 */
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
