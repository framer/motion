import { EasingFunction } from "./types"

/**
 * A straight easing curve.
 *
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.linear }}
 * />
 * ```
 *
 * @param progress - A value between `0` and `1`
 * @returns - A value between `0` and `1`
 *
 * @public
 */
export const linear: EasingFunction = p => p
