import { positionalValues } from "../unit-conversion"

describe("Unit conversion", () => {
    test("Correctly factors in padding when measuring width/height", () => {
        const testDimensions = {
            x: { min: 0, max: 100 },
            y: { min: 0, max: 300 },
        }
        expect(
            positionalValues.width(testDimensions, { paddingTop: "50px" })
        ).toBe(50)

        expect(
            positionalValues.width(testDimensions, { paddingBottom: "25px" })
        ).toBe(75)

        expect(
            positionalValues.height(testDimensions, { paddingLeft: "50px" })
        ).toBe(250)

        expect(
            positionalValues.height(testDimensions, { paddingRight: "25px" })
        ).toBe(275)
    })
})
