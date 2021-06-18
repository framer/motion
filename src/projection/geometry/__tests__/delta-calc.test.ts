import { isNear, calcAxisDelta } from "../delta-calc"
import { applyAxisDelta } from "../delta-apply"
import { createDelta } from "../models"

describe("isNear", () => {
    test("Correctly indicate when the provided value is within maxDistance of the provided target", () => {
        expect(isNear(10.1, 10, 0.1)).toBe(true)
        expect(isNear(9.9, 10, 0.1)).toBe(true)
        expect(isNear(10.2, 10, 0.1)).toBe(false)
        expect(isNear(9.8, 10, 0.1)).toBe(false)
    })
})

describe("calcAxisDelta", () => {
    test("Correctly calculate the a delta that, when applied to source, will make it the same as target", () => {
        const delta = createDelta()

        const source = { min: 100, max: 200 }
        const target = { min: 300, max: 500 }
        calcAxisDelta(delta.x, source, target)
        expect(delta.x).toEqual({
            translate: 250,
            scale: 2,
            origin: 0.5,
            originPoint: 150,
        })

        applyAxisDelta(
            source,
            delta.x.translate,
            delta.x.scale,
            delta.x.originPoint
        )
        expect(source).toEqual(target)
    })

    test("Accepts a custom origin", () => {
        const delta = createDelta()

        const source = { min: 100, max: 200 }
        const target = { min: 300, max: 500 }
        calcAxisDelta(delta.x, source, target, 0)
        expect(delta.x).toEqual({
            translate: 200,
            scale: 2,
            origin: 0,
            originPoint: 100,
        })

        applyAxisDelta(
            source,
            delta.x.translate,
            delta.x.scale,
            delta.x.originPoint
        )
        expect(source).toEqual(target)
    })
})
