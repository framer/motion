import { detectAxis } from "../detect-axis"

describe("detectAxis", () => {
    test("Detects axis of horizontally-arranged items", () => {
        expect(
            detectAxis(
                {
                    x: { min: 0, max: 100 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 100, max: 200 },
                    y: { min: 0, max: 100 },
                }
            )
        ).toEqual("x")

        expect(
            detectAxis(
                {
                    x: { min: 0, max: 100 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 101, max: 200 },
                    y: { min: 0, max: 100 },
                }
            )
        ).toEqual("x")

        expect(
            detectAxis(
                {
                    x: { min: 0, max: 100 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 101, max: 200 },
                    y: { min: 40, max: 60 },
                }
            )
        ).toEqual("x")
    })

    test("Detects axis of vertically-arranged items", () => {
        expect(
            detectAxis(
                {
                    x: { min: 0, max: 100 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 0, max: 200 },
                    y: { min: 100, max: 200 },
                }
            )
        ).toEqual("y")

        expect(
            detectAxis(
                {
                    x: { min: 0, max: 100 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 0, max: 200 },
                    y: { min: 101, max: 200 },
                }
            )
        ).toEqual("y")

        expect(
            detectAxis(
                {
                    x: { min: 40, max: 60 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 0, max: 100 },
                    y: { min: 100, max: 200 },
                }
            )
        ).toEqual("y")
    })

    test("Diagonally-arranged items default to horizontally-reorderable", () => {
        expect(
            detectAxis(
                {
                    x: { min: 0, max: 100 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 200, max: 300 },
                    y: { min: 200, max: 300 },
                }
            )
        ).toEqual("x")

        expect(
            detectAxis(
                {
                    x: { min: 0, max: 100 },
                    y: { min: 0, max: 100 },
                },
                {
                    x: { min: 100, max: 300 },
                    y: { min: 100, max: 300 },
                }
            )
        ).toEqual("x")
    })
})
