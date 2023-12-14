import { invariant } from "../../../utils/errors"
import { isNumericalString } from "../../../utils/is-numerical-string"
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
export function getVariableValue(
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
