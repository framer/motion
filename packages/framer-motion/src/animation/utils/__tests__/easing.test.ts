import { backIn } from "../../../easing/back"
import { cubicBezier } from "../../../easing/cubic-bezier"
import { easeInOut } from "../../../easing/ease"
import { noop } from "../../../utils/noop"
import { easingDefinitionToFunction } from "../easing"

describe("easingDefinitionToFunction", () => {
    test("Maps easing to lookup", () => {
        expect(easingDefinitionToFunction("linear")).toBe(noop)
        expect(easingDefinitionToFunction("easeInOut")).toBe(easeInOut)
        expect(easingDefinitionToFunction("backIn")).toBe(backIn)
        expect(easingDefinitionToFunction(backIn)).toBe(backIn)

        const bezier = easingDefinitionToFunction([0.2, 0.2, 0.8, 1])
        expect(bezier(0.45)).toEqual(cubicBezier(0.2, 0.2, 0.8, 1)(0.45))
    })
})
