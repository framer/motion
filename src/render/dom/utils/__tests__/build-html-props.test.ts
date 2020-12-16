import "../../../../../jest.setup"
import { HTMLVisualElement } from "../../HTMLVisualElement"
import { buildHTMLProps } from "../build-html-props"
import { motionValue } from "../../../../value"

const div = () => document.createElement("div")

const getMounted = () => {
    const visualElement = new HTMLVisualElement()
    const element = div()
    ;(visualElement as any).mount(element)

    return visualElement
}

describe("buildHTMLProps", () => {
    it("correctly generates props", () => {
        const element = getMounted()
        const x = motionValue(0)

        element.addValue("x", x)
        element.addValue("--a", x)
        x.set(100)

        element.reactStyle.color = "#fff"

        element.clean()
        element.build()

        const draggableProps = buildHTMLProps(element, { drag: true })

        expect(draggableProps).toEqual({
            style: {
                color: "#fff",
                transform: "translateX(100px) translateZ(0)",
                "--a": 100,
                touchAction: "none",
                userSelect: "none",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
            },
            draggable: false,
        })

        element.clean()
        element.build()
        const notDraggableProps = buildHTMLProps(element, { drag: false })

        expect(notDraggableProps).toEqual({
            style: {
                color: "#fff",
                transform: "translateX(100px) translateZ(0)",
                "--a": 100,
            },
        })
    })
})
