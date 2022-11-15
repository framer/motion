import { shouldAnimatePositionOnly } from "../delta-snapshot"

const square = {
    x: { min: 0, max: 100 },
    y: { min: 0, max: 100 },
}

const offsetSquare = {
    x: { min: 100, max: 200 },
    y: { min: 100, max: 200 },
}

const rect = {
    x: { min: 0, max: 200 },
    y: { min: 0, max: 100 },
}

describe("shouldAnimatePositionOnly", () => {
    test("Always returns true for type=position", () => {
        expect(
            shouldAnimatePositionOnly("position", square, offsetSquare)
        ).toEqual(true)
        expect(shouldAnimatePositionOnly("position", square, square)).toEqual(
            true
        )
        expect(shouldAnimatePositionOnly("position", rect, rect)).toEqual(true)
        expect(shouldAnimatePositionOnly("both", square, offsetSquare)).toEqual(
            false
        )
        expect(shouldAnimatePositionOnly("both", square, square)).toEqual(false)
        expect(shouldAnimatePositionOnly("both", rect, rect)).toEqual(false)
        expect(shouldAnimatePositionOnly("size", square, offsetSquare)).toEqual(
            false
        )
        expect(shouldAnimatePositionOnly("size", square, square)).toEqual(false)
        expect(shouldAnimatePositionOnly("size", rect, rect)).toEqual(false)
    })

    test("Only returns true for type=preserve-aspect when ratios are close", () => {
        expect(
            shouldAnimatePositionOnly("preserve-aspect", square, {
                x: { min: 100, max: 300 },
                y: { min: 100, max: 300 },
            })
        ).toEqual(false)
        expect(
            shouldAnimatePositionOnly("preserve-aspect", square, offsetSquare)
        ).toEqual(false)
        expect(
            shouldAnimatePositionOnly("preserve-aspect", square, {
                x: { min: 100, max: 201 },
                y: { min: 100, max: 200 },
            })
        ).toEqual(false)
        expect(
            shouldAnimatePositionOnly("preserve-aspect", square, {
                x: { min: 100, max: 250 },
                y: { min: 100, max: 200 },
            })
        ).toEqual(true)
        expect(
            shouldAnimatePositionOnly("preserve-aspect", square, square)
        ).toEqual(false)
        expect(
            shouldAnimatePositionOnly("preserve-aspect", rect, rect)
        ).toEqual(false)
        expect(
            shouldAnimatePositionOnly("preserve-aspect", square, rect)
        ).toEqual(true)
    })
})
