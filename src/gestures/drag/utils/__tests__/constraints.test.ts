import {
    calcRelativeAxisConstraints,
    applyConstraints,
    calcConstrainedMinPoint,
    calcViewportAxisConstraints,
    calcPositionFromProgress,
    rebaseAxisConstraints,
} from "../constraints"

describe("applyConstraints", () => {
    test("Returns points within the defined constraints", () => {
        expect(applyConstraints(10, { min: 0, max: 20 })).toBe(10)
    })
    test("Returns points outside the defined constraints when elastic is set to 1", () => {
        expect(applyConstraints(25, { min: 0, max: 20 }, 1)).toBe(25)
        expect(applyConstraints(-5, { min: 0, max: 20 }, 1)).toBe(-5)
    })
    test("Clamps points outside the defined constraints when elastic is set to 0", () => {
        expect(applyConstraints(25, { min: 0, max: 20 }, 0)).toBe(20)
        expect(applyConstraints(-5, { min: 0, max: 20 }, 0)).toBe(0)
    })
    test("Applies elastic factor if defined", () => {
        expect(applyConstraints(25, { min: 0, max: 20 }, 0.5)).toBe(22.5)
        expect(applyConstraints(-5, { min: 0, max: 20 }, 0.5)).toBe(-2.5)
        expect(applyConstraints(25, { min: 0, max: 20 }, 1)).toBe(25)
        expect(applyConstraints(-5, { min: 0, max: 20 }, 1)).toBe(-5)
        expect(applyConstraints(25, { min: 0, max: 20 }, 0)).toBe(20)
        expect(applyConstraints(-5, { min: 0, max: 20 }, 0)).toBe(0)
    })
})

describe("calcConstraintedMinPoint", () => {
    test("Correctly calculates a minimum point when no constraints are provided", () => {
        expect(calcConstrainedMinPoint(100, 100, 0.25)).toBe(75)
    })

    test("Correctly applies constraints", () => {
        expect(
            calcConstrainedMinPoint(100, 100, 0.25, { min: 100, max: 100 })
        ).toBe(100)
    })
})

describe("calcRelativeAxisConstraints", () => {
    test("Correctly calculates viewport constraints given a relative bounding box", () => {
        expect(
            calcRelativeAxisConstraints({ min: 0, max: 50 }, undefined, 100)
        ).toEqual({
            max: 100,
        })
        expect(
            calcRelativeAxisConstraints({ min: 0, max: 50 }, undefined, 50)
        ).toEqual({
            max: 50,
        })
        expect(
            calcRelativeAxisConstraints({ min: 0, max: 50 }, undefined, 200)
        ).toEqual({
            max: 200,
        })

        expect(
            calcRelativeAxisConstraints({ min: 100, max: 200 }, -100, 300)
        ).toEqual({
            min: 0,
            max: 400,
        })

        expect(
            calcRelativeAxisConstraints({ min: 100, max: 200 }, undefined, 300)
        ).toEqual({
            min: undefined,
            max: 400,
        })

        expect(
            calcRelativeAxisConstraints({ min: 100, max: 200 }, -100, undefined)
        ).toEqual({
            min: 0,
            max: undefined,
        })

        expect(
            calcRelativeAxisConstraints({ min: 0, max: 100 }, 0, 50)
        ).toEqual({ min: 0, max: 50 })

        expect(
            calcRelativeAxisConstraints({ min: 100, max: 200 }, 0, 50)
        ).toEqual({ min: 100, max: 150 })

        expect(
            calcRelativeAxisConstraints({ min: 214, max: 414 }, 0, 0)
        ).toEqual({ min: 214, max: 214 })

        expect(
            calcRelativeAxisConstraints({ min: 0, max: 100 }, 0, 100)
        ).toEqual({
            min: 0,
            max: 100,
        })

        expect(
            calcRelativeAxisConstraints({ min: 100, max: 200 }, 0, 100)
        ).toEqual({
            min: 100,
            max: 200,
        })
    })
})

describe("calcViewportAxisConstraints", () => {
    test("Correctly calculates constraints relative to the viewport when axis is smaller than and within constraints", () => {
        expect(
            calcViewportAxisConstraints(
                { min: 200, max: 250 },
                { min: 100, max: 300 }
            )
        ).toEqual({ min: 100, max: 250 })
    })
    test("Correctly calculates constraints relative to the viewport when axis is smaller than and overlaps constraints", () => {
        expect(
            calcViewportAxisConstraints(
                { min: 350, max: 450 },
                { min: 100, max: 300 }
            )
        ).toEqual({ min: 100, max: 200 })
    })
    test("Correctly calculates constraints relative to the viewport when axis is larger than constraints", () => {
        expect(
            calcViewportAxisConstraints(
                { min: 100, max: 600 },
                { min: 100, max: 300 }
            )
        ).toEqual({ min: -200, max: 100 })
    })
})

describe("calcPositionFromProgress", () => {
    test("Correctly calculates an axis within constraints based on a progress value", () => {
        expect(
            calcPositionFromProgress(
                { min: 100, max: 200 },
                { min: 0, max: 500 },
                0
            )
        ).toEqual({ min: 0, max: 100 })

        expect(
            calcPositionFromProgress(
                { min: 100, max: 200 },
                { min: 0, max: 500 },
                1
            )
        ).toEqual({ min: 400, max: 500 })
    })
})

describe("rebaseAxisConstraints", () => {
    test("Converts viewport-relative constraints to element-relative", () => {
        expect(
            rebaseAxisConstraints({ min: 0, max: 100 }, { min: -100 })
        ).toEqual({ min: -100 })
        expect(
            rebaseAxisConstraints({ min: 200, max: 300 }, { max: 400 })
        ).toEqual({ max: 200 })
    })
})
