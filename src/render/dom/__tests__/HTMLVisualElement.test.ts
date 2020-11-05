import "../../../../jest.setup"
import { HTMLVisualElement } from "../HTMLVisualElement"
import { motionValue } from "../../../value"
import { ResolvedValues } from "../../VisualElement/types"

const div = () => document.createElement("div")

const getMounted = () => {
    const visualElement = new HTMLVisualElement()
    const element = div()
    ;(visualElement as any).mount(element)

    return visualElement
}

describe("HTMLVisualElement", () => {
    it("mounts", () => {
        const visualElement = new HTMLVisualElement()
        const element = div()
        ;(visualElement as any).mount(element)
        expect(visualElement.getInstance()).toBe(element)
    })

    it("assigns parent", () => {
        const parent = new HTMLVisualElement()
        const child = new HTMLVisualElement(parent)

        expect((child as any).parent).toBe(parent)
    })

    it("fires provided onUpdate callbacks when values change", async () => {
        const promise = new Promise<ResolvedValues>((resolve) => {
            const visualElement = getMounted()
            visualElement.updateConfig({ onUpdate: resolve })
            const x = motionValue(0)

            visualElement.addValue("x", x)
            x.set(100)
        })

        return expect(promise).resolves.toEqual({ x: 100 })
    })

    it("updates CSS style and var on render", () => {
        const visualElement = getMounted()
        const x = motionValue(100)
        const varA = motionValue("#fff")

        visualElement.addValue("x", x)
        visualElement.addValue("--a", varA)

        visualElement.render()

        expect(visualElement.style.transform).toBe(
            "translateX(100px) translateZ(0)"
        )
        expect(visualElement.vars["--a"]).toBe("#fff")
    })

    it("handles CSS transforms", () => {
        const visualElement = getMounted()
        const x = motionValue(0)

        visualElement.addValue("x", x)
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle("transform: none")

        x.set(100)
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )

        const scale = motionValue(1)
        visualElement.addValue("scale", scale)
        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translateX(100px) scale(1) translateZ(0)"
        )
    })

    it("handles enableHardwareAcceleration", () => {
        const visualElement = getMounted()
        visualElement.updateConfig({
            enableHardwareAcceleration: false,
        })
        const x = motionValue(100)

        visualElement.addValue("x", x)
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translateX(100px)"
        )

        visualElement.updateConfig({
            enableHardwareAcceleration: true,
        })
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translateX(100px) translateZ(0)"
        )
    })

    it("handles allowTransformNone", () => {
        const visualElement = getMounted()
        visualElement.updateConfig({
            allowTransformNone: false,
            enableHardwareAcceleration: false,
        })
        const x = motionValue(0)

        visualElement.addValue("x", x)
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translateX(0px)"
        )
        visualElement.updateConfig({
            allowTransformNone: true,
            enableHardwareAcceleration: false,
        })
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle("transform: none")
    })

    it("handles transform origin", () => {
        const visualElement = getMounted()
        const originY = motionValue<string | number>(0.2)

        visualElement.addValue("originY", originY)
        visualElement.render()

        let expected = "50% 20% 0"
        // I can't get the style inspections in this test to throw
        expect(visualElement.getInstance()).toHaveStyle(
            `transform-origin: ${expected}`
        )
        // These work as expected
        expect(visualElement.style.transformOrigin).toBe(expected)

        originY.set("40%")

        visualElement.render()

        expected = "50% 40% 0"
        expect(visualElement.getInstance()).toHaveStyle(
            `transform-origin: ${expected}`
        )
        expect(visualElement.style.transformOrigin).toBe(expected)

        const originZ = motionValue(20)
        visualElement.addValue("originZ", originZ)
        visualElement.render()
        expected = "50% 40% 20px"
        expect(visualElement.getInstance()).toHaveStyle(
            `transform-origin: ${expected}`
        )
        expect(visualElement.style.transformOrigin).toBe(expected)
    })

    it("handles transformTemplate", () => {
        const visualElement = getMounted()
        const x = motionValue(100)

        visualElement.addValue("x", x)
        visualElement.updateConfig({
            transformTemplate: (_, generated) => `translate(-50%) ${generated}`,
        })
        visualElement.render()

        expect(visualElement.getInstance()).toHaveStyle(
            "transform: translate(-50%) translateX(100px) translateZ(0)"
        )
    })
})
