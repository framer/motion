import { cubicBezier } from "../cubic-bezier"

// Evaluate one axis of the curve at parameter t
const bezier = (t: number, p1: number, p2: number) =>
    3 * p1 * t * (1 - t) ** 2 + 3 * p2 * t * t * (1 - t) + t ** 3

const curves: [number, number, number, number][] = [
    [0.25, 0.1, 0.25, 1], // CSS ease
    [0.42, 0, 1, 1], // CSS ease-in
    [0, 0, 0.58, 1], // CSS ease-out
    [0.42, 0, 0.58, 1], // CSS ease-in-out
    [0.5, 0.1, 0.31, 0.96],
    [0.33, 1.53, 0.69, 0.99], // backOut
    [0.17, 0.67, 0.83, 0.67],
    [0, 1, 1, 0], // dx/dt = 0 at both ends
    [1, 0, 0, 1], // dx/dt = 0 at t = 0.5
    [0.9, 0.1, 0.1, 0.9],
    [0, 0.5, 0, 0.5],
    [1, 0.5, 1, 0.5],
    [0.5, 0, 0.5, 1],
    [0.32, 0.72, 0, 1],
]

describe("cubicBezier", () => {
    test("correctly generates easing functions from curve definitions", () => {
        const linear = cubicBezier(0, 0, 1, 1)
        expect(linear(0)).toBe(0)
        expect(linear(1)).toBe(1)
        expect(linear(0.5)).toBe(0.5)

        const curve = cubicBezier(0.5, 0.1, 0.31, 0.96)
        expect(curve(0)).toBe(0)
        expect(curve(0.01)).toBeCloseTo(0.002, 2)
        expect(curve(0.25)).toBeCloseTo(0.164, 2)
        expect(curve(0.75)).toBeCloseTo(0.935, 2)
        expect(curve(0.99)).toBeCloseTo(0.999, 2)
        expect(curve(1)).toBe(1)
    })

    test("output is not quantised", () => {
        const ease = cubicBezier(0.25, 0.1, 0.25, 1)
        const values = new Set<number>()
        for (let i = 0; i <= 1000; i++) values.add(ease(0.3 + i * 1e-6))
        expect(values.size).toBe(1001)
    })

    test("output matches points on the curve", () => {
        for (const [x1, y1, x2, y2] of curves) {
            const ease = cubicBezier(x1, y1, x2, y2)
            for (let i = 1; i < 200; i++) {
                const t = i / 200
                const x = bezier(t, x1, x2)
                const expected = bezier(t, y1, y2)
                // Where dx/dt is ~0, x barely changes with t and y is
                // ill-conditioned, so scale the tolerance by the slope.
                const dx =
                    3 * (1 - t) ** 2 * x1 +
                    6 * (1 - t) * t * (x2 - x1) +
                    3 * t * t * (1 - x2)
                const dy =
                    3 * (1 - t) ** 2 * y1 +
                    6 * (1 - t) * t * (y2 - y1) +
                    3 * t * t * (1 - y2)
                const tolerance =
                    1e-9 + 1e-9 * Math.abs(dy / Math.max(dx, 1e-6))
                expect(Math.abs(ease(x) - expected)).toBeLessThan(tolerance)
            }
        }
    })

    test("is monotonic for monotonic curves", () => {
        for (const [x1, y1, x2, y2] of [
            [0.25, 0.1, 0.25, 1],
            [0.42, 0, 0.58, 1],
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [0.9, 0.1, 0.1, 0.9],
        ]) {
            const ease = cubicBezier(x1, y1, x2, y2)
            let decreases = 0
            let prev = ease(0)
            for (let i = 1; i <= 100000; i++) {
                const v = ease(i / 100000)
                if (v < prev) decreases++
                prev = v
            }
            expect(decreases).toBe(0)
        }
    })

    test("solves exactly at points where the slope is 0", () => {
        // dx/dt = 0 at t = 0.5, where x = y = 0.5
        expect(cubicBezier(1, 0, 0, 1)(0.5)).toBeCloseTo(0.5, 12)
        // dx/dt = 0 at t = 0, y rises like sqrt(x)
        const ease = cubicBezier(0, 1, 1, 0)
        expect(ease(1e-8)).toBeGreaterThan(0)
        expect(ease(1e-8)).toBeLessThan(ease(2e-8))
    })

    test("returns exactly 0 and 1 at the start and end", () => {
        for (const [x1, y1, x2, y2] of curves) {
            const ease = cubicBezier(x1, y1, x2, y2)
            expect(ease(0)).toBe(0)
            expect(ease(1)).toBe(1)
        }
    })

    test("saturates to 0 and 1 beyond the start and end", () => {
        for (const [x1, y1, x2, y2] of curves) {
            const ease = cubicBezier(x1, y1, x2, y2)
            for (const x of [-1e9, -0.5, -1e-9]) {
                expect(Math.abs(ease(x))).toBeLessThan(1e-10)
            }
            for (const x of [1 + 1e-9, 1.5, 1e9]) {
                expect(Math.abs(ease(x) - 1)).toBeLessThan(1e-10)
            }
        }
    })
})
