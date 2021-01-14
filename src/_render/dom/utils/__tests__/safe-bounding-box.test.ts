import { safeBoundingBox } from "../safe-bounding-box"

describe("safeSize", () => {
    test("should return large bounding boxes as provided", () => {
        expect(
            safeBoundingBox({
                x: { min: 100, max: 200 },
                y: { min: 0, max: 100 },
            })
        ).toEqual({
            x: { min: 100, max: 200 },
            y: { min: 0, max: 100 },
        })
    })

    test("should return small bounding boxes as 1x1px min", () => {
        expect(
            safeBoundingBox({
                x: { min: 0, max: 0 },
                y: { min: 0, max: 0 },
            })
        ).toEqual({
            x: { min: -0.5, max: 0.5 },
            y: { min: -0.5, max: 0.5 },
        })
    })
})
