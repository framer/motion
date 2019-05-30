import { EasingFunction } from "./types"

/**
 * Default overshoot value for spring-like easings.
 *
 * @private
 */
export const defaultOvershootStrength = 1.525

/**
 * Accepts an easing function and returns a new one that inverts its curve.
 *
 * ```jsx
 * const easeIn = Easing.createExpoIn(3)
 * const easeOut = Easing.reverse(easeIn)
 * ```
 *
 * @param easing - The easing function to reverse.
 *
 * @public
 */
export function reverse(easing: EasingFunction): EasingFunction {
    return p => 1 - easing(1 - p)
}

/**
 * Accepts an easing function and returns a new one that mirrors its curve.
 *
 * ```jsx
 * const easeIn = Easing.createExpoIn(3)
 * const easeInOut = Easing.mirror(easeIn)
 * ```
 *
 * @param easing - The easing function to reverse.
 *
 * @public
 */
export function mirror(easing: EasingFunction): EasingFunction {
    return p => (p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2)
}
