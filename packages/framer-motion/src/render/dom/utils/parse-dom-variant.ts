import {
    DOMKeyframesDefinition,
    DOMValuesDefinition,
} from "../../../animation/types"
import type { VisualElement } from "../../VisualElement"
import { resolveCSSVariables } from "./css-variables-conversion"
import { unitConversion } from "./unit-conversion"

export type MakeTargetAnimatable<T = unknown> = (
    visualElement: VisualElement<T>,
    target: DOMKeyframesDefinition,
    origin?: DOMValuesDefinition,
    transitionEnd?: DOMValuesDefinition
) => {
    target: DOMKeyframesDefinition
    transitionEnd?: DOMValuesDefinition
}

/**
 * Parse a DOM variant to make it animatable. This involves resolving CSS variables
 * and ensuring animations like "20%" => "calc(50vw)" are performed in pixels.
 */
export const parseDomVariant: MakeTargetAnimatable<HTMLElement | SVGElement> = (
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
