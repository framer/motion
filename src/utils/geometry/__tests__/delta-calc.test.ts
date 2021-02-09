import { isNear, calcOrigin, updateAxisDelta } from "../delta-calc"

describe("isNear", () => {
    test("Correctly indicate when the provided value is within maxDistance of the provided target", () => {
        expect(isNear(10.1, 10, 0.1)).toBe(true)
        expect(isNear(9.9, 10, 0.1)).toBe(true)
        expect(isNear(10.2, 10, 0.1)).toBe(false)
        expect(isNear(9.8, 10, 0.1)).toBe(false)
    })
})

describe("calcOrigin", () => {
    test("Correctly calculates an origin ", () => {
        expect(calcOrigin({ min: 0, max: 100 }, { min: 0, max: 100 })).toBe(0.5)
        expect(calcOrigin({ min: -100, max: 100 }, { min: -50, max: 50 })).toBe(
            0.5
        )
        expect(calcOrigin({ min: -50, max: 50 }, { min: -100, max: 100 })).toBe(
            0.5
        )
        expect(calcOrigin({ min: 200, max: 200 }, { min: 0, max: 100 })).toBe(1)
        expect(calcOrigin({ min: 200, max: 200 }, { min: 300, max: 500 })).toBe(
            0
        )
    })
})

describe("updateAxisDelta", () => {
    test("Correctly updates the axis delta with a delta that will, when applied, project source onto delta", () => {
        const axisDelta = { scale: 1, translate: 0, origin: 0, originPoint: 0 }
        updateAxisDelta(
            axisDelta,
            { min: 100, max: 200 },
            { min: 300, max: 500 },
            0.5
        )
        expect(axisDelta).toEqual({
            origin: 0.5,
            originPoint: 150,
            scale: 2,
            translate: 250,
        })
    })
    test("Correctly updates the axis delta with a delta that will, when applied, project source onto delta with a defined origin", () => {
        const axisDelta = { scale: 1, translate: 0, origin: 0, originPoint: 0 }
        updateAxisDelta(
            axisDelta,
            { min: 100, max: 200 },
            { min: 300, max: 500 },
            1
        )
        expect(axisDelta).toEqual({
            origin: 1,
            originPoint: 200,
            scale: 2,
            translate: 300,
        })
    })
})
