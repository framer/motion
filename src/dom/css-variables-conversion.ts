import { RefObject } from "react"
import { MotionValuesMap } from "../motion/utils/use-motion-values"
import { Target, TargetWithKeyframes } from "../types"
import { invariant } from "hey-listen"

function isCSSVariable(value: any): value is string {
    return typeof value === "string" && value.startsWith("var(--")
}

/**
 * Parse Framer's special CSS variable format into a CSS token and a fallback.
 *
 * ```
 * `var(--foo, #fff)` => [`--foo`, '#fff']
 * ```
 *
 * @param current
 */
const cssVariableRegex = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z,0-9 ()%#-]+)?\)/
export function parseCSSVariable(current: string) {
    let token: string | undefined
    let fallback: string | undefined
    const match = cssVariableRegex.exec(current)

    if (match) {
        ;[, token, fallback] = match
    }

    return [token, fallback]
}

const maxDepth = 4
function getVariableValue(
    current: string,
    element: HTMLElement,
    depth = 1
): string | undefined {
    invariant(
        depth < maxDepth,
        `Max CSS variable depth detected in property "${current}"`
    )

    const [token, fallback] = parseCSSVariable(current)

    // No CSS variable detected
    if (!token) return

    // Attempt to read this CSS variable off the element
    const resolved = window.getComputedStyle(element).getPropertyValue(token)

    if (resolved) {
        return resolved
    } else if (isCSSVariable(fallback)) {
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
    values: MotionValuesMap,
    ref: RefObject<Element>,
    { ...target }: TargetWithKeyframes,
    { ...transitionEnd }: Target | undefined
): { target: TargetWithKeyframes; transitionEnd?: Target } {
    const { current: element } = ref
    if (!(element instanceof HTMLElement)) return { target, transitionEnd }

    // Go through existing `MotionValue`s and ensure any existing CSS variables are resolved
    values.forEach(value => {
        const current = value.get()
        if (!isCSSVariable(current)) return

        const resolved = getVariableValue(current, element)
        if (resolved) value.set(resolved)
    })

    // Cycle through every target property and resolve CSS variables. Currently
    // we only read single-var properties like `var(--foo)`, not `calc(var(--foo) + 20px)`
    for (const key in target) {
        const current = target[key]
        if (!isCSSVariable(current)) continue

        const resolved = getVariableValue(current, element)
        if (!resolved) continue

        // Clone target if it hasn't already been
        target[key] = resolved

        // If the user hasn't already set this key on `transitionEnd`, set it to the unresolved
        // CSS variable. This will ensure that after the animation the component will reflect
        // changes in the value of the CSS variable.
        if (transitionEnd && transitionEnd[key] === undefined) {
            transitionEnd[key] = current
        }
    }

    return { target, transitionEnd }
}
