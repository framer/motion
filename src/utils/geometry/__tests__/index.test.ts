import {
    convertBoundingBoxToAxisBox,
    transformBoundingBox,
    calcAxisCenter,
    convertAxisBoxToBoundingBox,
    copyAxisBox,
} from ".."

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

describe("convertAxisBoxToBoundingBox", () => {
    test("correctly converts an AxisBox to a BoundingBox", () => {
        expect(
            convertAxisBoxToBoundingBox({
                x: { min: 20, max: 30 },
                y: { min: 10, max: 40 },
            })
        ).toEqual({
            top: 10,
            left: 20,
            right: 30,
            bottom: 40,
        })
    })
})

describe("calcAxisCenter", () => {
    test("correctly returns the center of a single axis", () => {
        expect(calcAxisCenter({ min: -100, max: 200 })).toEqual(50)
        expect(calcAxisCenter({ min: 600, max: 700 })).toEqual(650)
    })
})

describe("copyAxisBox", () => {
    test("returns a copy of the provided box", () => {
        const box = {
            x: { min: 0, max: 1 },
            y: { min: 2, max: 3 },
        }
        const copy = copyAxisBox(box)
        expect(copyAxisBox(box)).toEqual(copy)
        expect(copyAxisBox(box)).not.toBe(copy)
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
