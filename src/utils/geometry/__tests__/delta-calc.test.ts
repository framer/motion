import {
    isNear,
    calcTranslate,
    calcOrigin,
    updateAxisDelta,
} from "../delta-calc"

describe("isNear", () => {
    test("Correctly indicate when the provided value is within maxDistance of the provided target", () => {
        expect(isNear(10.1, 10, 0.1)).toBe(true)
        expect(isNear(9.9, 10, 0.1)).toBe(true)
        expect(isNear(10.2, 10, 0.1)).toBe(false)
        expect(isNear(9.8, 10, 0.1)).toBe(false)
    })
})

describe("calcTranslate", () => {
    test("Calculates the translation needed to be applied to source axis to return target axis", () => {
        // Same size, static
        expect(
            calcTranslate({ min: 0, max: 100 }, { min: 0, max: 100 }, 0.5)
        ).toBe(0)
        expect(
            calcTranslate({ min: 0, max: 100 }, { min: 0, max: 100 }, 1)
        ).toBe(0)
        expect(
            calcTranslate({ min: 0, max: 100 }, { min: 0, max: 100 }, 0)
        ).toBe(0)

        // Same size, translated
        expect(
            calcTranslate({ min: 0, max: 100 }, { min: 100, max: 200 }, 0)
        ).toBe(100)
        expect(
            calcTranslate({ min: 0, max: 100 }, { min: 100, max: 200 }, 0.5)
        ).toBe(100)
        expect(
            calcTranslate({ min: 0, max: 100 }, { min: 100, max: 200 }, 1)
        ).toBe(100)

        // Different size, static
        expect(
            calcTranslate({ min: 400, max: 500 }, { min: 400, max: 700 }, 0)
        ).toBe(0)
        expect(
            calcTranslate({ min: 400, max: 500 }, { min: 200, max: 700 }, 0.5)
        ).toBe(0)

        // Different size, translated
        expect(
            calcTranslate({ min: 200, max: 400 }, { min: 400, max: 800 }, 0.5)
        ).toBe(300)
        expect(
            calcTranslate({ min: 400, max: 800 }, { min: 200, max: 400 }, 0)
        ).toBe(-200)
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
            { min: 300, max: 500 }
        )
        expect(axisDelta).toEqual({
            origin: 0,
            originPoint: 100,
            scale: 2,
            translate: 200,
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
