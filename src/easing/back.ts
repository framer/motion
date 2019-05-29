import { reversed, mirrored, defaultOvershootStrength } from "./modifiers"
import { EasingFunction } from "./types"

/**
 * Creates an easing function whose overshoot is based on the provided `power`.
 *
 * @param power - Strength of the overshoot. Defaults to `1.525`.
 */
export const createBackIn = (
    power: number = defaultOvershootStrength
): EasingFunction => p => p * p * ((power + 1) * p - power)

/**
 * @public
 */
export const backIn = createBackIn()

/**
 * @public
 */
export const backOut = reversed(backIn)

/**
 * @public
 */
export const backInOut = mirrored(backIn)
