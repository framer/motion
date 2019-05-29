import { EasingFunction } from "./types"

// Magic
const ca = 4356.0 / 361.0
const cb = 35442.0 / 1805.0
const cc = 16061.0 / 1805.0

/**
 * @public
 */
export const createBounce = (
    thresholdA = 0.363636,
    thresholdB = 0.72727,
    thresholdC = 0.9
): EasingFunction => p => {
    const p2 = p * p

    return p < thresholdA
        ? 7.5625 * p2
        : p < thresholdB
        ? 9.075 * p2 - 9.9 * p + 3.4
        : p < thresholdC
        ? ca * p2 - cb * p + cc
        : 10.8 * p * p - 20.52 * p + 10.72
}

/**
 * @public
 */
export const bounceIn = (p: number) => 1.0 - bounceOut(1.0 - p)

/**
 * @public
 */
export const bounceOut = createBounce()

/**
 * @public
 */
export const bounceInOut = (p: number) =>
    p < 0.5
        ? 0.5 * (1.0 - bounceOut(1.0 - p * 2.0))
        : 0.5 * bounceOut(p * 2.0 - 1.0) + 0.5
