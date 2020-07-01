import { correctBorderRadius, correctBoxShadow } from "../scale-correction"

describe("correctBorderRadius", () => {
    test("returns a corrected border radius when provided a single number", () => {
        expect(correctBorderRadius(10, 1, 1)).toBe("10px 10px")
        expect(correctBorderRadius(10, 0.5, 2)).toBe("20px 5px")
    })
})

describe("correctBoxShadow", () => {
    test("returns a corrected border radius when provided a single number", () => {
        expect(correctBoxShadow("10px 10px 20px #fff", 1, 1)).toBe(
            "10px 10px 20px #fff"
        )
        expect(correctBoxShadow("10px 10px 20px #fff", 0.5, 2)).toBe(
            "10px 10px 20px #fff"
        )
        expect(correctBoxShadow("10px 10px 20px 20px #fff", 1, 1)).toBe(
            "10px 10px 20px #fff"
        )
        expect(correctBoxShadow("10px 10px 20px 20px #fff", 0.5, 2)).toBe(
            "10px 10px 20px #fff"
        )
    })
})
