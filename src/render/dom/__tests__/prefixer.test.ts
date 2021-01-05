import "../../../../jest.setup"
import prefixer from "../utils/prefixer"

const div = () => document.createElement("div")

describe("prefixer", () => {
    test("prefix raw css property (dashed)", () => {
        const prefixedCss = prefixer("transform", true, div())
        expect(prefixedCss).toEqual("-webkit-transform")
    })
    test("prefix css object key (CSSProperties)", () => {
        const cssPropKey = prefixer("transform", false, div())
        expect(cssPropKey).toEqual("webkitTransform")
    })
})
