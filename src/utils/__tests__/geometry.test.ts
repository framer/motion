import {
    convertBoundingBoxToAxisBox,
    transformBoundingBox,
    calcAxisCenter,
} from "../geometry"

describe("convertBoundingBoxToAxisBox", () => {
    test("correctly converts a BoundingBox to AxisBox", () => {
        expect(
            convertBoundingBoxToAxisBox({
                top: 10,
                left: -100,
                right: 300,
                bottom: 100,
            })
        ).toEqual({
            x: { min: -100, max: 300 },
            y: { min: 10, max: 100 },
        })
    })
})

describe("calcAxisCenter", () => {
    test("correctly returns the center of a single axis", () => {
        expect(calcAxisCenter({ min: -100, max: 200 })).toEqual(100)
        expect(calcAxisCenter({ min: 600, max: 700 })).toEqual(650)
    })
})

describe("transformBoundingBox", () => {
    test("correctly applies transformPoint functions to each axis", () => {
        expect(
            transformBoundingBox(
                {
                    top: 10,
                    left: 20,
                    bottom: 20,
                    right: 100,
                },
                ({ x, y }) => ({ x: x * 2, y: y / 2 })
            )
        ).toEqual({
            top: 5,
            left: 40,
            bottom: 10,
            right: 200,
        })
    })

    test("leaves bounding boxes untouched if no transformPoint function is provided", () => {
        expect(
            transformBoundingBox({
                top: 10,
                left: -100,
                right: 300,
                bottom: 100,
            })
        ).toEqual({
            top: 10,
            left: -100,
            right: 300,
            bottom: 100,
        })
    })
})
