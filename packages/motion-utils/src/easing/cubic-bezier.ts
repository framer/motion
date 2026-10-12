/*
  Bezier function generator
  This has been modified from Gaëtan Renaudeau's BezierEasing
  https://github.com/gre/bezier-easing/blob/master/src/index.js
  https://github.com/gre/bezier-easing/blob/master/LICENSE

  t is found for a given x with Newton-Raphson, safeguarded by a bisection
  bracket: whenever a Newton step would leave the bracket (near flat parts
  of the curve), it bisects instead. This converges to full precision in
  ~4 iterations on typical curves, so output is smooth rather than snapped
  to a fixed bisection grid. The lookup table is omitted to save bytes.
  Usage
    const easeOut = cubicBezier(.17,.67,.83,.67);
    const x = easeOut(0.5); // returns 0.627...
*/

import { noop } from "../noop"

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
const calcBezier = (t: number, a1: number, a2: number) =>
    (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) *
    t

// Returns dx/dt given t, x1, and x2.
const getSlope = (t: number, a1: number, a2: number) =>
    (3.0 * (1.0 - 3.0 * a2 + 3.0 * a1) * t + 2.0 * (3.0 * a2 - 6.0 * a1)) * t +
    3.0 * a1

const precision = 1e-14
const maxIterations = 40

function getTForX(x: number, mX1: number, mX2: number) {
    let lowerBound = 0
    let upperBound = 1
    let t = x

    for (let i = 0; i < maxIterations; i++) {
        const currentX = calcBezier(t, mX1, mX2) - x
        if (Math.abs(currentX) < precision) break
        currentX > 0 ? (upperBound = t) : (lowerBound = t)

        // Newton-Raphson step. If it leaves the bracket, which happens
        // where the slope is ~0, bisect instead.
        t -= currentX / getSlope(t, mX1, mX2)
        if (!(t > lowerBound && t < upperBound)) {
            t = (lowerBound + upperBound) / 2
        }
    }

    return t
}

/*#__NO_SIDE_EFFECTS__*/
export function cubicBezier(
    mX1: number,
    mY1: number,
    mX2: number,
    mY2: number
) {
    // If this is a linear gradient, return linear easing
    if (mX1 === mY1 && mX2 === mY2) return noop

    // At or outside the start/end, return exactly 0 or 1
    return (t: number) =>
        t > 0 && t < 1 ? calcBezier(getTForX(t, mX1, mX2), mY1, mY2) : +(t >= 1)
}
