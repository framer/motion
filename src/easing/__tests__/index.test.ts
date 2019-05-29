import { Easing } from ".."

describe("Easing", () => {
    test("linear", () => {
        expect(Easing.linear(0.5)).toBe(0.5)
    })

    test("cubicBezier", () => {
        expect(Easing.cubicBezier(0, 0, 1, 1)(0)).toBe(0)
        expect(Easing.cubicBezier(0, 0, 1, 1)(0.5)).toBe(0.5)
        expect(Easing.cubicBezier(0.42, 0, 0.58, 1)(1)).toBe(1)
        expect(Easing.cubicBezier(0.22, 1.08, 0.41, 1.55)(0.5) > 1).toBe(true)
    })

    test("steps", () => {
        const stepEnd = Easing.steps(4)
        expect(stepEnd(0)).toBe(0)
        expect(stepEnd(0.2)).toBe(0)
        expect(stepEnd(0.249)).toBe(0)
        expect(stepEnd(0.25)).toBe(0.25)
        expect(stepEnd(0.49)).toBe(0.25)
        expect(stepEnd(0.5)).toBe(0.5)
        expect(stepEnd(0.99)).toBe(0.75)
        expect(stepEnd(1)).toBe(0.75)

        const stepStart = Easing.steps(4, "start")
        expect(stepStart(0)).toBe(0.25)
        expect(stepStart(0.2)).toBe(0.25)
        expect(stepStart(0.249)).toBe(0.25)
        expect(stepStart(0.25)).toBe(0.25)
        expect(stepStart(0.49)).toBe(0.5)
        expect(stepStart(0.5)).toBe(0.5)
        expect(stepStart(0.51)).toBe(0.75)
        expect(stepStart(0.99)).toBe(1)
        expect(stepStart(1)).toBe(1)
        expect(stepStart(2)).toBe(1)
    })
})
