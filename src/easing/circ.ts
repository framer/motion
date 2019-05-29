import { EasingFunction } from "./types"
import { reversed, mirrored } from "./modifiers"

/**
 * @public
 */
export const circIn: EasingFunction = p => 1 - Math.sin(Math.acos(p))

/**
 * @public
 */
export const circOut = reversed(circIn)

/**
 * @public
 */
export const circInOut = mirrored(circOut)
