import { calcRelativeAxisConstraints } from "../constraints"

describe("calcRelativeAxisConstraints", () => {
    test("Correctly calculates viewport constraints given a relative bounding box", () => {
        expect(
            calcRelativeAxisConstraints({ min: 100, max: 300 }, -100, 300)
        ).toEqual({
            min: 0,
            max: 200,
        })

        expect(
            calcRelativeAxisConstraints({ min: 100, max: 300 }, undefined, 300)
        ).toEqual({
            min: undefined,
            max: 200,
        })

        expect(
            calcRelativeAxisConstraints({ min: 100, max: 300 }, -100, undefined)
        ).toEqual({
            min: 0,
            max: undefined,
        })
    })
})
