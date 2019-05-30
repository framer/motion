import { reverse, mirror } from "./modifiers"
import { EasingFunction } from "./types"

/**
 * Creates an easing function that is based on the exponent of the provided `power`.
 * The higher `power` is, the stronger the easing curve.
 *
 * ```jsx
 * const quadIn = Easing.createExpoIn(4)
 * ```
 *
 * @param power - Exponent of the easing curve. Defaults to `2`.
 *
 * @public
 */
export function createExpoIn(power: number = 2): EasingFunction {
    return p => p ** power
}
/**
 *
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.expoIn }}
 * />
 * ```
 *
 * @public
 */
export const expoIn = createExpoIn(2)

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.expoOut }}
 * />
 * ```
 * @public
 */
export const expoOut = reverse(expoIn)

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.expoInOut }}
 * />
 * ```
 * @public
 */
export const expoInOut = mirror(expoIn)
