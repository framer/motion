import "../../../../../jest.setup"
import { buildSVGPath } from "../svg-path"

describe("buildSVGPath", () => {
    it("correctly generates SVG path props", () => {
        const attrs = {}

        buildSVGPath(attrs, 200, 0.5, 0.25, 0.25)

        expect(attrs["stroke-dashoffset"]).toBe("-50px")
        expect(attrs["stroke-dasharray"]).toBe("100px 50px")
    })
})
