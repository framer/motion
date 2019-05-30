import { reverse, mirror, defaultOvershootStrength } from "./modifiers"
import { EasingFunction } from "./types"

/**
 * Creates an easing function whose overshoot is based on the provided `power`.
 *
 * ```jsx
 * const strongOvershoot = Easing.reverse(Easing.backIn(3))
 * ```
 *
 * @param power - Strength of the overshoot. Defaults to `1.525`.
 *
 * @public
 */
export function createBackIn(
    power: number = defaultOvershootStrength
): EasingFunction {
    return p => p * p * ((power + 1) * p - power)
}

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.backIn }}
 * />
 * ```
 * @public
 */
export const backIn = createBackIn()

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.backOut }}
 * />
 * ```
 * @public
 */
export const backOut = reverse(backIn)

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.backInOut }}
 * />
 * ```
 * @public
 */
export const backInOut = mirror(backIn)
