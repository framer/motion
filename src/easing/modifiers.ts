import { EasingFunction } from "./types"

export type EasingModifier = (easing: EasingFunction) => EasingFunction

/**
 * Default overshoot value for spring-like easings.
 *
 * @private
 */
export const defaultOvershootStrength = 1.525

/**
 * Accepts an easing function and returns a new one that inverts its curve.
 *
 * For instance, `reversed(linear)(1)` would return `0`
 *
 * @param easing - The easing function to reverse.
 *
 * @public
 */
export const reversed: EasingModifier = easing => p => 1 - easing(1 - p)

/**
 * Accepts an easing function and returns a new one that mirrors its curve.
 *
 * For instance, `mirrored(linear)(0.5)` would return `1`.
 *
 * @param easing - The easing function to reverse.
 *
 * @public
 */
export const mirrored: EasingModifier = easing => p =>
    p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2
