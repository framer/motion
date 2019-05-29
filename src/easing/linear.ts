import { EasingFunction } from "./types"

/**
 * A straight easing curve.
 *
 * @param progress - A value between `0` and `1`
 * @returns - A value between `0` and `1`
 *
 * @public
 */
export const linear: EasingFunction = p => p
