import { Target, TargetWithKeyframes } from "../../../types";
import { VisualElement } from "../../types";
/**
 * Parse Framer's special CSS variable format into a CSS token and a fallback.
 *
 * ```
 * `var(--foo, #fff)` => [`--foo`, '#fff']
 * ```
 *
 * @param current
 */
export declare const cssVariableRegex: RegExp;
export declare function parseCSSVariable(current: string): string[] | undefined[];
/**
 * Resolve CSS variables from
 *
 * @internal
 */
export declare function resolveCSSVariables(visualElement: VisualElement, { ...target }: TargetWithKeyframes, transitionEnd: Target | undefined): {
    target: TargetWithKeyframes;
    transitionEnd?: Target;
};
