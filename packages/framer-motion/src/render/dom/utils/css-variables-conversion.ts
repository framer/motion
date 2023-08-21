import { Target, TargetWithKeyframes } from "../../../types"
import { invariant } from "../../../utils/errors"
import { isNumericalString } from "../../../utils/is-numerical-string"
import type { VisualElement } from "../../VisualElement"
import { isCSSVariableToken, CSSVariableToken } from "./is-css-variable"

/**
 * Parse Framer's special CSS variable format into a CSS token and a fallback.
 *
 * ```
 * `var(--foo, #fff)` => [`--foo`, '#fff']
 * ```
 *
 * @param current
 */
const splitCSSVariableRegex =
    /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/
export function parseCSSVariable(current: string) {
    const match = splitCSSVariableRegex.exec(current)
    if (!match) return [,]

    const [, token, fallback] = match
    return [token, fallback]
}

const maxDepth = 4
function getVariableValue(
    current: CSSVariableToken,
    element: Element,
    depth = 1
): string | number | undefined {
    invariant(
        depth <= maxDepth,
        `Max CSS variable fallback depth detected in property "${current}". This may indicate a circular fallback dependency.`
    )

    const [token, fallback] = parseCSSVariable(current)

    // No CSS variable detected
    if (!token) return

    // Attempt to read this CSS variable off the element
    const resolved = window.getComputedStyle(element).getPropertyValue(token)

    if (resolved) {
        const trimmed = resolved.trim()
        return isNumericalString(trimmed) ? parseFloat(trimmed) : trimmed
    } else if (isCSSVariableToken(fallback)) {
        // The fallback might itself be a CSS variable, in which case we attempt to resolve it too.
        return getVariableValue(fallback, element, depth + 1)
    } else {
        return fallback
    }
}

/**
 * Resolve CSS variables from
 *
 * @internal
 */
export function resolveCSSVariables(
    visualElement: VisualElement,
    { ...target }: TargetWithKeyframes,
    transitionEnd: Target | undefined
): { target: TargetWithKeyframes; transitionEnd?: Target } {
    const element = visualElement.current
    if (!(element instanceof Element)) return { target, transitionEnd }

    // If `transitionEnd` isn't `undefined`, clone it. We could clone `target` and `transitionEnd`
    // only if they change but I think this reads clearer and this isn't a performance-critical path.
    if (transitionEnd) {
        transitionEnd = { ...transitionEnd }
    }

    // Go through existing `MotionValue`s and ensure any existing CSS variables are resolved
    visualElement.values.forEach((value) => {
        const current = value.get()
        if (!isCSSVariableToken(current)) return

        const resolved = getVariableValue(current, element)
        if (resolved) value.set(resolved)
    })

    // Cycle through every target property and resolve CSS variables. Currently
    // we only read single-var properties like `var(--foo)`, not `calc(var(--foo) + 20px)`
    for (const key in target) {
        const current = target[key]
        if (!isCSSVariableToken(current)) continue

        const resolved = getVariableValue(current, element)

        if (!resolved) continue

        // Clone target if it hasn't already been
        target[key] = resolved

        if (!transitionEnd) transitionEnd = {}

        // If the user hasn't already set this key on `transitionEnd`, set it to the unresolved
        // CSS variable. This will ensure that after the animation the component will reflect
        // changes in the value of the CSS variable.
        if (transitionEnd[key] === undefined) {
            transitionEnd[key] = current
        }
    }

    return { target, transitionEnd }
}
