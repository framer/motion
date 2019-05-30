import { EasingFunction } from "./types"
import { reverse, mirror } from "./modifiers"

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.circIn }}
 * />
 * ```
 * @public
 */
export const circIn: EasingFunction = p => 1 - Math.sin(Math.acos(p))

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.circOut }}
 * />
 * ```
 * @public
 */
export const circOut = reverse(circIn)

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.circInOut }}
 * />
 * ```
 * @public
 */
export const circInOut = mirror(circOut)
