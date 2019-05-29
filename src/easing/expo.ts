import { reversed, mirrored } from "./modifiers"
import { EasingFunction } from "./types"

/**
 * Creates an easing function that is based on the exponent of the provided `power`.
 * The higher `power` is, the stronger the easing curve.
 *
 * @param power - Exponent of the easing curve. Defaults to `2`.
 *
 * @public
 */
export const createExpoIn = (power: number = 2): EasingFunction => p =>
    p ** power

/**
 * @public
 */
export const expoIn = createExpoIn(2)

/**
 * @public
 */
export const expoOut = reversed(expoIn)

/**
 * @public
 */
export const expoInOut = mirrored(expoIn)
