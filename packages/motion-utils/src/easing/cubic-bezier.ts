/*
  Bezier function generator
  This has been modified from Gaëtan Renaudeau's BezierEasing
  https://github.com/gre/bezier-easing/blob/master/src/index.js
  https://github.com/gre/bezier-easing/blob/master/LICENSE

  t is found for a given x with Newton-Raphson, safeguarded by a bisection
  bracket: whenever a Newton step would leave the bracket (near flat parts
  of the curve), it bisects instead. This converges to full precision in
  ~5 iterations on typical curves, so output is smooth rather than snapped
  to a fixed bisection grid. The slope is estimated with a forward
  difference, and the lookup table is omitted, to save bytes.

  x = 0 and x = 1 return exactly 0 and 1. x outside [0, 1] starts outside
  the bracket, so it bisects towards the nearer end and saturates to within
  ~1e-12 of 0 or 1.
  Usage
    const easeOut = cubicBezier(.17,.67,.83,.67);
    const x = easeOut(0.5); // returns 0.627...
*/

import { noop } from "../noop"

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
// Bernstein form, so it is exactly 0 at t = 0 and exactly 1 at t = 1.
const calcBezier = (t: number, a1: number, a2: number) =>
    t * (3 * (1 - t) * ((1 - t) * a1 + t * a2) + t * t)

/*#__NO_SIDE_EFFECTS__*/
export function cubicBezier(
    mX1: number,
    mY1: number,
    mX2: number,
    mY2: number
) {
    // If this is a linear gradient, return linear easing
    if (mX1 === mY1 && mX2 === mY2) return noop

    return (x: number) => {
        let lowerBound = 0
        let upperBound = 1
        let t = x

        for (let i = 0; ; i++) {
            // If t is outside the bracket, because x is out of range or a
            // Newton step overshot where the slope is ~0, bisect instead.
            if (!(t >= lowerBound && t <= upperBound)) {
                t = (lowerBound + upperBound) / 2
            }

            const currentX = calcBezier(t, mX1, mX2) - x
            if (currentX * currentX < 1e-28 || i === 40) break
            currentX > 0 ? (upperBound = t) : (lowerBound = t)

            // Newton-Raphson step, with dx/dt from a forward difference
            t -=
                (currentX * 1e-7) /
                (calcBezier(t + 1e-7, mX1, mX2) - x - currentX)
        }

        return calcBezier(t, mY1, mY2)
    }
}
