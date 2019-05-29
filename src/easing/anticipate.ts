import { EasingFunction } from "./types"
import { defaultOvershootStrength } from "./modifiers"
import { createBackIn } from "./back"

/**
 * Creates an easing function that pulls back a little before moving, and then
 * finishes with a `backOut` overshoot.
 *
 * @param power - Strength of the overshoot. Defaults to `1.525`.
 */
export const createAnticipate = (
    power: number = defaultOvershootStrength
): EasingFunction => {
    const backEasing = createBackIn(power)

    return p =>
        (p *= 2) < 1
            ? 0.5 * backEasing(p)
            : 0.5 * (2 - Math.pow(2, -10 * (p - 1)))
}

/**
 * @public
 */
export const anticipate = createAnticipate()
