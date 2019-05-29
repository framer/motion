import { EasingFunction } from "./types"

/**
 * Bezier function generator
 *
 * Based on Gaëtan Renaudeau's BezierEasing
 * https://github.com/gre/bezier-easing/blob/master/index.js
 * https://github.com/gre/bezier-easing/blob/master/LICENSE
 */

// Constants
const newtonIterations = 8
const newtonMinSlope = 0.001
const subdivisionPrecision = 0.0000001
const subdivisionMaxIterations = 10
const kSplineTableSize = 11
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0)

// Helper methods
const a = (a1: number, a2: number) => 1.0 - 3.0 * a2 + 3.0 * a1
const b = (a1: number, a2: number) => 3.0 * a2 - 6.0 * a1
const c = (a1: number) => 3.0 * a1

const getSlope = (t: number, a1: number, a2: number) =>
    3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1)

const calcBezier = (t: number, a1: number, a2: number) =>
    ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t

/**
 * Create a cubic bezier easing function.
 *
 * @param x1 -
 * @param y1 -
 * @param x2 -
 * @param y2 -
 */
export function cubicBezier(
    x1: number,
    y1: number,
    x2: number,
    y2: number
): EasingFunction {
    const sampleValues = new Float32Array(kSplineTableSize)

    const binarySubdivide = (aX: number, aA: number, aB: number) => {
        let i = 0
        let currentX
        let currentT

        do {
            currentT = aA + (aB - aA) / 2.0
            currentX = calcBezier(currentT, x1, x2) - aX
            if (currentX > 0.0) {
                aB = currentT
            } else {
                aA = currentT
            }
        } while (
            Math.abs(currentX) > subdivisionPrecision &&
            ++i < subdivisionMaxIterations
        )

        return currentT
    }

    const newtonRaphsonIterate = (aX: number, aGuessT: number) => {
        let i = 0
        let currentSlope = 0
        let currentX

        for (; i < newtonIterations; ++i) {
            currentSlope = getSlope(aGuessT, x1, x2)

            if (currentSlope === 0.0) {
                return aGuessT
            }

            currentX = calcBezier(aGuessT, x1, x2) - aX
            aGuessT -= currentX / currentSlope
        }

        return aGuessT
    }

    const calcSampleValues = () => {
        for (let i = 0; i < kSplineTableSize; ++i) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, x1, x2)
        }
    }

    const getTForX = (aX: number) => {
        let intervalStart = 0.0
        let currentSample = 1
        const lastSample = kSplineTableSize - 1
        let dist = 0.0
        let guessForT = 0.0
        let initialSlope = 0.0

        for (
            ;
            currentSample !== lastSample && sampleValues[currentSample] <= aX;
            ++currentSample
        ) {
            intervalStart += kSampleStepSize
        }

        --currentSample

        dist =
            (aX - sampleValues[currentSample]) /
            (sampleValues[currentSample + 1] - sampleValues[currentSample])
        guessForT = intervalStart + dist * kSampleStepSize

        initialSlope = getSlope(guessForT, x1, x2)

        // If slope is greater than min
        if (initialSlope >= newtonMinSlope) {
            return newtonRaphsonIterate(aX, guessForT)
            // Slope is equal to min
        } else if (initialSlope === 0.0) {
            return guessForT
            // Slope is less than min
        } else {
            return binarySubdivide(
                aX,
                intervalStart,
                intervalStart + kSampleStepSize
            )
        }
    }

    calcSampleValues()

    const resolver = (aX: number) => {
        let returnValue

        // If linear gradient, return X as T
        if (x1 === y1 && x2 === y2) {
            returnValue = aX

            // If at start, return 0
        } else if (aX === 0) {
            returnValue = 0

            // If at end, return 1
        } else if (aX === 1) {
            returnValue = 1
        } else {
            returnValue = calcBezier(getTForX(aX), y1, y2)
        }

        return returnValue
    }

    return resolver
}
