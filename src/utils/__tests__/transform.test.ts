import "../../../jest.setup"
import { transform } from "../transform"

// Functionality of `transform` is thoroughly tested in `@popmotion/popcorn/interpolate`
// but here we test the overload functionality
describe("transform", () => {
    test("works identically with both syntax", () => {
        expect(transform([0, 1], [0, 100], { clamp: false })(-0.5)).toEqual(
            transform(-0.5, [0, 1], [0, 100], { clamp: false })
        )
    })
})
