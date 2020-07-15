import "../../../../jest.setup"
import { SVGVisualElement } from "../SVGVisualElement"
import { motionValue } from "../../../value"
import { ResolvedValues } from "../../types"

const path = () => document.createElement("path")

const getMounted = () => {
    const visualElement = new SVGVisualElement()
    const element = path()
    ;(visualElement as any).mount(element)

    return visualElement
}

describe("SVGVisualElement", () => {
    it("mounts", () => {
        const visualElement = new SVGVisualElement()
        const element = path()
        ;(visualElement as any).mount(element)
        expect(visualElement.getInstance()).toBe(element)
    })

    it("assigns parent", () => {
        const parent = new SVGVisualElement()
        const child = new SVGVisualElement(parent)

        expect((child as any).parent).toBe(parent)
    })

    it("fires provided onUpdate callbacks when values change", async () => {
        const promise = new Promise<ResolvedValues>(resolve => {
            const visualElement = getMounted()
            visualElement.updateConfig({ onUpdate: resolve })
            const x = motionValue(0)

            visualElement.addValue("x", x)
            x.set(100)
        })

        return expect(promise).resolves.toEqual({ x: 100 })
    })

    it("updates CSS attrs and var on render", () => {
        const visualElement = getMounted()
        const x = motionValue(100)
        const varA = motionValue("#fff")

        visualElement.addValue("x", x)
        visualElement.addValue("--a", varA)

        visualElement.render()

        expect(visualElement.style.transform).toBe("translateX(100px)")
        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translateX(100px)"
        )
        expect(visualElement.vars["--a"]).toBe("#fff")
    })
})
