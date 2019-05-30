import { EasingFunction } from "./types"
import { reverse } from "./modifiers"

// Magic
const ca = 4356.0 / 361.0
const cb = 35442.0 / 1805.0
const cc = 16061.0 / 1805.0

/**
 * Create an easing that bounces at the end.
 *
 * @public
 */
export function createBounce(
    thresholdA = 0.363636,
    thresholdB = 0.72727,
    thresholdC = 0.9
): EasingFunction {
    return p => {
        const p2 = p * p

        return p < thresholdA
            ? 7.5625 * p2
            : p < thresholdB
            ? 9.075 * p2 - 9.9 * p + 3.4
            : p < thresholdC
            ? ca * p2 - cb * p + cc
            : 10.8 * p * p - 20.52 * p + 10.72
    }
}

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.bounceOut }}
 * />
 * ```
 * @public
 */
export const bounceOut = createBounce()

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.bounceIn }}
 * />
 * ```
 * @public
 */
export const bounceIn = reverse(bounceOut)

/**
 * ```jsx
 * <Frame
 *   animate={{ rotate: 360 }}
 *   transition={{ ease: Easing.bounceInOut }}
 * />
 * ```
 * @public
 */
export const bounceInOut: EasingFunction = p =>
    p < 0.5
        ? 0.5 * (1.0 - bounceOut(1.0 - p * 2.0))
        : 0.5 * bounceOut(p * 2.0 - 1.0) + 0.5
