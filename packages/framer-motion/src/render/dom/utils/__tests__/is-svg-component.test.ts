import { isSVGComponent } from "../is-svg-component"

describe("isSVGComponent", () => {
    test("Correctly identifies SVG components", () => {
        expect(isSVGComponent("circle")).toBe(true)
        expect(isSVGComponent("div")).toBe(false)
        expect(isSVGComponent("feGaussian")).toBe(true)
        expect(isSVGComponent("test-element")).toBe(false)
        expect(isSVGComponent(() => null)).toBe(false)
    })
})
