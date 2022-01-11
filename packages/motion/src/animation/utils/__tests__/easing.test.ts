import { easingDefinitionToFunction } from "../easing"
import { linear, cubicBezier, easeInOut, backIn } from "popmotion"

describe("easingDefinitionToFunction", () => {
    test("Maps easing to lookup", () => {
        expect(easingDefinitionToFunction("linear")).toBe(linear)
        expect(easingDefinitionToFunction("easeInOut")).toBe(easeInOut)
        expect(easingDefinitionToFunction("backIn")).toBe(backIn)
        expect(easingDefinitionToFunction(backIn)).toBe(backIn)

        const bezier = easingDefinitionToFunction([0.2, 0.2, 0.8, 1])
        expect(bezier(0.45)).toEqual(cubicBezier(0.2, 0.2, 0.8, 1)(0.45))
    })
})
